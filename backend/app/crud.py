from sqlalchemy.orm import Session
from sqlalchemy import or_, func, cast, Date, text, Integer
from sqlalchemy.dialects.postgresql import ARRAY, TEXT
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import secrets
from . import models, schemas, ai_service
from .services import auth_service
from .state import ticket_subscribers

# Function to get all tickets, with optional skip and limit for pagination
def get_tickets(
    db: Session, 
    user_id: int,
    role: str = "user",
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None
):
    query = db.query(models.Ticket)
    
    # Role-based ticket visibility:
    # - users: only their own submitted tickets
    # - agents: only tickets assigned to them OR unassigned (prevents cross-agent data leakage)
    # - admins: all tickets
    if role == "user":
        query = query.filter(models.Ticket.user_id == user_id)
    elif role == "agent":
        query = query.filter(
            or_(
                models.Ticket.assigned_agent_id == user_id,
                models.Ticket.assigned_agent_id.is_(None),
            )
        )
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Ticket.subject.ilike(search_term),
                models.Ticket.customer_name.ilike(search_term),
                models.Ticket.message.ilike(search_term)
            )
        )
        
    if status:
        query = query.filter(models.Ticket.status == status)
        
    if category:
        query = query.filter(models.Ticket.category == category)
        
    if urgency:
        query = query.filter(models.Ticket.urgency == urgency)
        
    return query.order_by(models.Ticket.id.desc()).offset(skip).limit(limit).all()

# Function to get a single ticket by ID
def get_ticket(db: Session, ticket_id: int, user_id: int, role: str = "user"):
    query = db.query(models.Ticket).filter(models.Ticket.id == ticket_id)
    
    # Role-based access: users see only their own; agents see own-assigned + unassigned; admins see all
    if role == "user":
        query = query.filter(models.Ticket.user_id == user_id)
    elif role == "agent":
        query = query.filter(
            or_(
                models.Ticket.assigned_agent_id == user_id,
                models.Ticket.assigned_agent_id.is_(None),
            )
        )
    
    return query.first()

# Function to update a ticket's status
async def update_ticket_status(db: Session, ticket_id: int, status: str, user_id: int, role: str = "user"):
    db_ticket = get_ticket(db, ticket_id, user_id, role=role)
    if db_ticket:
        db_ticket.status = status

        # Set or clear resolved_at
        if status == "resolved":
            db_ticket.resolved_at = datetime.now(timezone.utc)
        else:
            db_ticket.resolved_at = None

        # Set or clear closed_at
        if status == "closed":
            db_ticket.closed_at = datetime.now(timezone.utc)
        else:
            db_ticket.closed_at = None

        db.commit()
        db.refresh(db_ticket)

        # Notify all active SSE subscribers for this ticket
        # Send the full ticket object so the frontend never has to guess
        # which fields are present in the payload (avoids blank-field bugs
        # caused by partial-delta replacement).
        if ticket_id in ticket_subscribers:
            ticket_schema = schemas.Ticket.model_validate(db_ticket)
            ticket_data = ticket_schema.model_dump_json()
            for queue in list(ticket_subscribers[ticket_id]):
                await queue.put(ticket_data)

    return db_ticket

# Function to create a new ticket
def create_ticket(db: Session, ticket: schemas.TicketCreate, user_id: int, user: models.User):
    # Step 1: Call the AI service to classify the ticket based on subject and message
    classification = ai_service.classify_ticket(subject=ticket.subject, message=ticket.message)
    
    # Step 2: Call the AI service to generate a draft response
    draft_response = ai_service.generate_draft_response(
        customer_name=user.name,
        subject=ticket.subject,
        message=ticket.message,
        category=classification.get("category"),
        urgency=classification.get("urgency"),
        sentiment=classification.get("sentiment")
    )
    
    confidence = classification.get("confidence", 0.0)
    category = classification.get("category")
    
    # Step 3: Suggest an agent based on the ticket category
    suggested_agent = suggest_agent(db, category=category)
    
    # Step 4: Create the ticket object with the AI metadata
    db_ticket = models.Ticket(
        user_id=user_id,
        customer_name=user.name,
        customer_email=user.email,
        subject=ticket.subject,
        message=ticket.message,
        status="open", # Default status when a ticket is created
        category=category,
        urgency=classification.get("urgency"),
        sentiment=classification.get("sentiment"),
        confidence=confidence,
        routing_reasoning=classification.get("reasoning"),
        needs_review=(confidence < 0.70),
        ai_draft_response=draft_response,
        # Store AI's agent suggestion (read-only from API, used for feedback loops)
        ai_suggested_agent_id=suggested_agent.id if suggested_agent else None,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

# ─── Public (unauthenticated) ticket helpers ──────────────────────────────────

def get_or_create_guest_user(db: Session, name: str, email: str) -> models.User:
    """
    Look up a user by email. If none exists, create one with role='user' and
    a securely random, unguessable hashed password — they won't log in with it
    unless they later request a password reset.

    NOTE: If the email belongs to an existing agent or admin, that user is
    returned as-is. This is an accepted edge-case for demo purposes.
    """
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        return existing

    random_password = secrets.token_urlsafe(32)
    hashed = auth_service.get_password_hash(random_password)

    guest = models.User(
        name=name,
        email=email,
        hashed_password=hashed,
        role="user",
        categories=[],
    )
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


def get_or_create_google_user(db: Session, email: str, name: str) -> models.User:
    """
    Look up a user by email. If none exists, create one with role='user' and
    a securely random, unguessable hashed password — Google users authenticate
    via ID token, not a password, so the hashed password is intentionally inaccessible.

    If the email already belongs to an existing account (email+password signup),
    return that account — this merges Google and password auth on the same email.
    """
    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        return existing

    random_password = secrets.token_urlsafe(32)
    hashed = auth_service.get_password_hash(random_password)

    new_user = models.User(
        name=name,
        email=email,
        hashed_password=hashed,
        role="user",
        categories=[],
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def count_recent_public_tickets(db: Session, email: str, window_hours: int = 1) -> int:
    """
    Count tickets submitted from this email address in the last `window_hours` hours.
    Queries tickets.customer_email directly (denormalized column) — no join needed.
    Used for basic spam protection on the public endpoint.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=window_hours)
    return (
        db.query(models.Ticket)
        .filter(
            models.Ticket.customer_email == email,
            models.Ticket.created_at >= cutoff,
        )
        .count()
    )


def create_public_ticket(
    db: Session,
    ticket_data: schemas.PublicTicketCreate,
) -> schemas.PublicTicketResponse:
    """
    End-to-end handler for unauthenticated ticket submission.
    Resolves (or creates) a guest user, then delegates to the existing
    create_ticket() so AI classification + agent suggestion run identically.
    Returns a minimal PublicTicketResponse — no internal AI fields exposed.
    """
    user = get_or_create_guest_user(db, name=ticket_data.name, email=ticket_data.email)

    ticket_create = schemas.TicketCreate(
        subject=ticket_data.subject,
        message=ticket_data.message,
    )
    db_ticket = create_ticket(db=db, ticket=ticket_create, user_id=user.id, user=user)

    return schemas.PublicTicketResponse(
        ticket_id=db_ticket.id,
        status=db_ticket.status,
        message="Ticket submitted successfully",
    )


# ─── Agent Assignment Functions ────────────────────────────────────────────────

def suggest_agent(db: Session, category: Optional[str]) -> Optional[models.User]:
    """
    Find the best available agent for a given ticket category.

    Queries agents whose `categories` array contains the ticket category,
    then orders by open ticket count ascending (least-loaded agent first).
    Returns the top result, or None if no match is found.
    """
    if not category:
        return None

    # Subquery: count open/in_progress tickets assigned to each agent
    open_count_subq = (
        db.query(
            models.Ticket.assigned_agent_id,
            func.count(models.Ticket.id).label("open_count"),
        )
        .filter(models.Ticket.status.in_(["open", "in_progress"]))
        .filter(models.Ticket.assigned_agent_id.isnot(None))
        .group_by(models.Ticket.assigned_agent_id)
        .subquery()
    )

    # Query agents that handle this category, ranked by workload
    agent = (
        db.query(models.User)
        .outerjoin(open_count_subq, models.User.id == open_count_subq.c.assigned_agent_id)
        .filter(models.User.role == "agent")
        # Raw SQL fragment ensures correct ARRAY['...']::TEXT[] syntax for PostgreSQL @> operator.
        .filter(text("categories @> ARRAY[:cat]::TEXT[]").bindparams(cat=category))
        .order_by(func.coalesce(open_count_subq.c.open_count, 0).asc())
        .first()
    )
    return agent


def assign_agent(
    db: Session,
    ticket_id: int,
    agent_id: int,
    reason: str,
) -> Optional[models.Ticket]:
    """
    Assign an agent to a ticket.

    Sets assigned_agent_id, assigned_at, and assignment_reason.
    Returns the updated ticket or None if not found.
    """
    db_ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not db_ticket:
        return None

    db_ticket.assigned_agent_id = agent_id
    db_ticket.assigned_at = datetime.now(timezone.utc)
    db_ticket.assignment_reason = reason

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def get_agents(db: Session) -> List[dict]:
    """
    Return all users with role='agent', each annotated with their
    current open ticket count (open or in_progress tickets assigned to them).
    """
    # Subquery for open ticket counts per agent
    open_count_subq = (
        db.query(
            models.Ticket.assigned_agent_id,
            func.count(models.Ticket.id).label("open_count"),
        )
        .filter(models.Ticket.status.in_(["open", "in_progress"]))
        .filter(models.Ticket.assigned_agent_id.isnot(None))
        .group_by(models.Ticket.assigned_agent_id)
        .subquery()
    )

    rows = (
        db.query(
            models.User,
            func.coalesce(open_count_subq.c.open_count, 0).label("open_ticket_count"),
        )
        .outerjoin(open_count_subq, models.User.id == open_count_subq.c.assigned_agent_id)
        .filter(models.User.role == "agent")
        .order_by(models.User.name.asc())
        .all()
    )

    result = []
    for user, open_ticket_count in rows:
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "categories": user.categories or [],
            "open_ticket_count": open_ticket_count,
        })
    return result


def get_my_queue(db: Session, agent_id: int) -> List[models.Ticket]:
    """
    Return all open/in_progress tickets assigned to a specific agent.
    Used for the agent's My Queue view.
    """
    return (
        db.query(models.Ticket)
        .filter(
            models.Ticket.assigned_agent_id == agent_id,
            models.Ticket.status.in_(["open", "in_progress"]),
        )
        .order_by(models.Ticket.id.desc())
        .all()
    )


# ─── Analytics functions ───────────────────────────────────────────────────────

def get_analytics_overview(db: Session, user_id: int, role: str = "user"):
    base_query = db.query(models.Ticket)
    
    # Only filter by user_id for regular users; admins and agents see all tickets
    if role == "user":
        base_query = base_query.filter(models.Ticket.user_id == user_id)
    
    total_tickets = base_query.count()
    open_tickets = base_query.filter(models.Ticket.status == "open").count()
    in_progress_tickets = base_query.filter(models.Ticket.status == "in_progress").count()
    resolved_tickets = base_query.filter(models.Ticket.status == "resolved").count()
    high_urgency_tickets = base_query.filter(models.Ticket.urgency == "high").count()
    
    # Calculate a resolution rate (resolved / total)
    resolution_rate = round((resolved_tickets / total_tickets * 100) if total_tickets > 0 else 0)
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "high_urgency_tickets": high_urgency_tickets,
        "resolution_rate": resolution_rate
    }

def get_analytics_charts(db: Session, user_id: int, role: str = "user"):
    # Real tickets created over time, grouped by date
    date_group = cast(models.Ticket.created_at, Date)
    
    daily_volume_query = db.query(
        date_group.label("date"),
        func.count(models.Ticket.id)
    )
    
    # Only filter by user_id for regular users; admins and agents see all tickets
    if role == "user":
        daily_volume_query = daily_volume_query.filter(models.Ticket.user_id == user_id)
    
    daily_volume = daily_volume_query.group_by(
        date_group
    ).order_by(
        date_group
    ).limit(30).all()
    
    volume_trend = [{"name": str(date), "tickets": count} for date, count in daily_volume]
    
    # Category distribution
    categories_query = db.query(
        models.Ticket.category, 
        func.count(models.Ticket.id)
    )
    if role == "user":
        categories_query = categories_query.filter(models.Ticket.user_id == user_id)
    categories = categories_query.group_by(models.Ticket.category).all()
    category_distribution = [{"name": cat or "Uncategorized", "value": count} for cat, count in categories]
    
    # Status distribution
    statuses_query = db.query(
        models.Ticket.status, 
        func.count(models.Ticket.id)
    )
    if role == "user":
        statuses_query = statuses_query.filter(models.Ticket.user_id == user_id)
    statuses = statuses_query.group_by(models.Ticket.status).all()
    status_distribution = [{"name": stat, "value": count} for stat, count in statuses]

    return {
        "volume_trend": volume_trend,
        "category_distribution": category_distribution,
        "status_distribution": status_distribution
    }

def get_aggregated_customers(db: Session, user_id: int, role: str = "user"):
    # Group by customer_name and email, calculate ticket count and get max ticket ID for latest info
    agg_query = db.query(
        models.Ticket.customer_name,
        models.Ticket.customer_email,
        func.count(models.Ticket.id).label("ticket_count"),
        func.max(models.Ticket.id).label("latest_ticket_id")
    )
    
    # Only filter by user_id for regular users; admins and agents see all tickets
    if role == "user":
        agg_query = agg_query.filter(models.Ticket.user_id == user_id)
    
    results = agg_query.group_by(
        models.Ticket.customer_name,
        models.Ticket.customer_email
    ).all()

    # Now we need the status of the latest ticket for each customer
    customers = []
    for r in results:
        # Fetch the latest ticket for this customer
        latest_ticket = get_ticket(db, r.latest_ticket_id, user_id, role=role)
        status = latest_ticket.status if latest_ticket else "unknown"
        last_active = latest_ticket.created_at.strftime("%Y-%m-%d %H:%M") if latest_ticket else "Unknown"
        
        customers.append({
            "name": r.customer_name or "Unknown",
            "email": r.customer_email or "",
            "tickets": r.ticket_count,
            "status": status,
            "lastActive": last_active
        })
        
    # Sort by ticket count descending
    customers.sort(key=lambda x: x["tickets"], reverse=True)
    return customers

def get_needs_review_tickets(db: Session, user_id: int, role: str = "user", skip: int = 0, limit: int = 100):
    query = db.query(models.Ticket).filter(
        models.Ticket.needs_review == True,
        models.Ticket.status == "open"
    )
    
    # Only filter by user_id for regular users; admins and agents see all needs-review tickets
    if role == "user":
        query = query.filter(models.Ticket.user_id == user_id)
    
    return query.order_by(models.Ticket.id.desc()).offset(skip).limit(limit).all()


# ─── Feedback CRUD ─────────────────────────────────────────────────────────────────

from fastapi import HTTPException

def submit_feedback(
    db: Session,
    ticket_id: int,
    agent_id: int,
    feedback: schemas.FeedbackCreate,
) -> models.ClassificationFeedback:
    """
    Insert a classification_feedback row.
    Raises HTTP 400 if this agent already submitted feedback for this ticket.
    """
    existing = (
        db.query(models.ClassificationFeedback)
        .filter(
            models.ClassificationFeedback.ticket_id == ticket_id,
            models.ClassificationFeedback.agent_id == agent_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Feedback already submitted for this ticket")

    db_feedback = models.ClassificationFeedback(
        ticket_id=ticket_id,
        agent_id=agent_id,
        is_correct=feedback.is_correct,
        correct_category=feedback.correct_category,
        correct_urgency=feedback.correct_urgency,
        feedback_note=feedback.feedback_note,
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def get_agent_feedback_for_ticket(
    db: Session,
    ticket_id: int,
    agent_id: int,
) -> Optional[models.ClassificationFeedback]:
    """
    Return the feedback row for this agent+ticket combination, or None.
    """
    return (
        db.query(models.ClassificationFeedback)
        .filter(
            models.ClassificationFeedback.ticket_id == ticket_id,
            models.ClassificationFeedback.agent_id == agent_id,
        )
        .first()
    )


def get_accuracy_metrics(db: Session) -> schemas.AccuracyMetrics:
    """
    Compute overall AI classification accuracy and a per-category breakdown.
    Joins classification_feedback with tickets to get the ticket category.
    """
    total_feedback = db.query(models.ClassificationFeedback).count()
    correct_count = (
        db.query(models.ClassificationFeedback)
        .filter(models.ClassificationFeedback.is_correct == True)
        .count()
    )
    incorrect_count = total_feedback - correct_count
    accuracy_rate = round((correct_count / total_feedback * 100) if total_feedback > 0 else 0.0, 2)

    # Per-category breakdown: join feedback → tickets to get ticket.category
    rows = (
        db.query(
            models.Ticket.category.label("category"),
            func.count(models.ClassificationFeedback.id).label("total"),
            func.sum(
                func.cast(models.ClassificationFeedback.is_correct, Integer)
            ).label("correct"),
        )
        .join(models.Ticket, models.ClassificationFeedback.ticket_id == models.Ticket.id)
        .group_by(models.Ticket.category)
        .all()
    )

    by_category = [
        schemas.CategoryAccuracy(
            category=row.category or "Uncategorized",
            total=row.total,
            correct=int(row.correct or 0),
            accuracy=round((int(row.correct or 0) / row.total * 100) if row.total > 0 else 0.0, 2),
        )
        for row in rows
    ]

    return schemas.AccuracyMetrics(
        total_feedback=total_feedback,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        accuracy_rate=accuracy_rate,
        by_category=by_category,
    )
