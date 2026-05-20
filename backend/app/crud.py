from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional
from . import models, schemas, ai_service

# Function to get all tickets, with optional skip and limit for pagination
def get_tickets(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None
):
    query = db.query(models.Ticket)
    
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
def get_ticket(db: Session, ticket_id: int):
    return db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()

# Function to update a ticket's status
def update_ticket_status(db: Session, ticket_id: int, status: str):
    db_ticket = get_ticket(db, ticket_id)
    if db_ticket:
        db_ticket.status = status
        db.commit()
        db.refresh(db_ticket)
    return db_ticket

# Function to create a new ticket
def create_ticket(db: Session, ticket: schemas.TicketCreate):
    # Step 1: Call the AI service to classify the ticket based on subject and message
    classification = ai_service.classify_ticket(subject=ticket.subject, message=ticket.message)
    
    # Step 2: Call the AI service to generate a draft response
    draft_response = ai_service.generate_draft_response(
        customer_name=ticket.customer_name,
        subject=ticket.subject,
        message=ticket.message,
        category=classification.get("category"),
        urgency=classification.get("urgency"),
        sentiment=classification.get("sentiment")
    )
    
    # Step 3: Create the ticket object with the AI metadata
    db_ticket = models.Ticket(
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        message=ticket.message,
        status="open", # Default status when a ticket is created
        category=classification.get("category"),
        urgency=classification.get("urgency"),
        sentiment=classification.get("sentiment"),
        ai_draft_response=draft_response
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

# Analytics functions
def get_analytics_overview(db: Session):
    total_tickets = db.query(func.count(models.Ticket.id)).scalar()
    open_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "open").scalar()
    in_progress_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "in_progress").scalar()
    resolved_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "resolved").scalar()
    high_urgency_tickets = db.query(func.count(models.Ticket.id)).filter(models.Ticket.urgency == "high").scalar()
    
    # Calculate a mock resolution rate (resolved / total)
    resolution_rate = round((resolved_tickets / total_tickets * 100) if total_tickets > 0 else 0)
    
    return {
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "in_progress_tickets": in_progress_tickets,
        "resolved_tickets": resolved_tickets,
        "high_urgency_tickets": high_urgency_tickets,
        "resolution_rate": resolution_rate
    }

def get_analytics_charts(db: Session):
    # Mocking tickets created over time (e.g. past 7 days) since we don't have a created_at timestamp in the model yet.
    # We will just return some dummy trend data. If we had created_at, we would group by date.
    volume_trend = [
        {"name": "Mon", "tickets": 12},
        {"name": "Tue", "tickets": 19},
        {"name": "Wed", "tickets": 15},
        {"name": "Thu", "tickets": 22},
        {"name": "Fri", "tickets": 28},
        {"name": "Sat", "tickets": 10},
        {"name": "Sun", "tickets": 5},
    ]
    
    # Category distribution
    categories = db.query(models.Ticket.category, func.count(models.Ticket.id)).group_by(models.Ticket.category).all()
    category_distribution = [{"name": cat or "Uncategorized", "value": count} for cat, count in categories]
    
    # Status distribution
    statuses = db.query(models.Ticket.status, func.count(models.Ticket.id)).group_by(models.Ticket.status).all()
    status_distribution = [{"name": stat, "value": count} for stat, count in statuses]

    return {
        "volume_trend": volume_trend,
        "category_distribution": category_distribution,
        "status_distribution": status_distribution
    }

def get_aggregated_customers(db: Session):
    # Group by customer_name and email, calculate ticket count and get max ticket ID for latest info
    results = db.query(
        models.Ticket.customer_name,
        models.Ticket.customer_email,
        func.count(models.Ticket.id).label("ticket_count"),
        func.max(models.Ticket.id).label("latest_ticket_id")
    ).group_by(
        models.Ticket.customer_name,
        models.Ticket.customer_email
    ).all()

    # Now we need the status of the latest ticket for each customer
    customers = []
    for r in results:
        # Fetch the latest ticket for this customer
        latest_ticket = get_ticket(db, r.latest_ticket_id)
        status = latest_ticket.status if latest_ticket else "unknown"
        
        customers.append({
            "name": r.customer_name or "Unknown",
            "email": r.customer_email or "",
            "tickets": r.ticket_count,
            "status": status,
            "lastActive": "Recently" # Mocked since we don't have created_at
        })
        
    # Sort by ticket count descending
    customers.sort(key=lambda x: x["tickets"], reverse=True)
    return customers
