from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import asyncio
import json
import jwt
from jwt.exceptions import InvalidTokenError

from .. import schemas, crud, models
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..services import auth_service
from ..state import ticket_subscribers

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)

@router.post("/public", response_model=schemas.PublicTicketResponse, status_code=201)
def create_public_ticket(
    ticket: schemas.PublicTicketCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a support ticket without authentication.
    Any visitor can use this endpoint — no Bearer token required.

    Rate limit: max 5 submissions per email address per hour.
    Returns a minimal confirmation (ticket ID + status) — no AI fields exposed.
    """
    # ── Rate limiting: check tickets.customer_email directly (no join needed) ──
    recent_count = crud.count_recent_public_tickets(db, email=ticket.email)
    if recent_count >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many submissions. Please try again later.",
        )

    return crud.create_public_ticket(db=db, ticket_data=ticket)


@router.post("/", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Create a new ticket.
    """
    return crud.create_ticket(db=db, ticket=ticket, user_id=current_user.id, user=current_user)


@router.get("/", response_model=List[schemas.Ticket])
def read_tickets(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Retrieve all tickets with optional pagination and filtering.
    """
    tickets = crud.get_tickets(
        db, 
        user_id=current_user.id,
        role=current_user.role,
        skip=skip, 
        limit=limit,
        search=search,
        status=status,
        category=category,
        urgency=urgency
    )
    return tickets

@router.get("/export")
def export_tickets(
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Export tickets to a CSV file based on current filters.
    """
    tickets = crud.get_tickets(
        db, 
        user_id=current_user.id,
        role=current_user.role,
        skip=0, 
        limit=10000, # Large limit for export
        search=search,
        status=status,
        category=category,
        urgency=urgency
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["ID", "Customer Name", "Customer Email", "Subject", "Status", "Category", "Urgency", "Sentiment"])
    
    # Write data
    for t in tickets:
        writer.writerow([
            t.id, 
            t.customer_name, 
            t.customer_email or "", 
            t.subject, 
            t.status, 
            t.category or "", 
            t.urgency or "", 
            t.sentiment or ""
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tickets_export.csv"}
    )

@router.get("/needs-review", response_model=List[schemas.Ticket])
def read_needs_review_tickets(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin", "agent"))
):
    """
    Retrieve tickets where needs_review is True and status is "open".
    Admins and agents see all such tickets; regular users see only their own.
    """
    tickets = crud.get_needs_review_tickets(
        db,
        user_id=current_user.id,
        role=current_user.role,
        skip=skip,
        limit=limit
    )
    return tickets

@router.get("/my-queue", response_model=List[schemas.Ticket])
def read_my_queue(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin", "agent"))
):
    """
    Return open/in_progress tickets assigned to the currently logged-in agent.
    """
    return crud.get_my_queue(db, agent_id=current_user.id)

@router.get("/{ticket_id}", response_model=schemas.Ticket)
def read_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Retrieve a specific ticket by ID.
    """
    db_ticket = crud.get_ticket(db, ticket_id=ticket_id, user_id=current_user.id, role=current_user.role)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@router.patch("/{ticket_id}/status", response_model=schemas.Ticket)
async def update_ticket_status(ticket_id: int, status_update: schemas.TicketUpdateStatus, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Update the status of a specific ticket and push the updated ticket to all active SSE subscribers.
    """
    db_ticket = await crud.update_ticket_status(db, ticket_id=ticket_id, status=status_update.status, user_id=current_user.id, role=current_user.role)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return db_ticket

@router.patch("/{ticket_id}/assign", response_model=schemas.Ticket)
async def assign_ticket(
    ticket_id: int,
    assignment: schemas.TicketAssign,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("admin")),
):
    """
    Assign an agent to a ticket (admin only).
    Accepts { agent_id, reason } and emits a ticket_assigned SSE event to all subscribers.
    """
    # Verify the target agent exists and has the agent role
    agent = db.query(models.User).filter(
        models.User.id == assignment.agent_id,
        models.User.role == "agent"
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    db_ticket = crud.assign_agent(
        db,
        ticket_id=ticket_id,
        agent_id=assignment.agent_id,
        reason=assignment.reason,
    )
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Push a ticket_assigned SSE event to all active subscribers for this ticket.
    # The _event field lets the frontend branch without changing the SSE wire format.
    if ticket_id in ticket_subscribers:
        ticket_schema = schemas.Ticket.model_validate(db_ticket)
        payload = ticket_schema.model_dump()
        payload["_event"] = "ticket_assigned"
        for queue in list(ticket_subscribers[ticket_id]):
            await queue.put(json.dumps(payload, default=str))

    return db_ticket


@router.get("/{ticket_id}/stream")
async def stream_ticket(
    ticket_id: int,
    token: str = Query(..., description="JWT access token (EventSource cannot send custom headers)"),
    db: Session = Depends(get_db),
):
    """
    SSE endpoint for real-time ticket status updates.
    Clients connect here after a normal fetch; updates are pushed whenever the ticket status changes.
    A heartbeat ping is sent every 15 seconds to keep the connection alive.
    """
    # --- Validate the JWT token manually (EventSource cannot send Authorization header) ---
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, auth_service.SECRET_KEY, algorithms=[auth_service.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception

    # Verify the ticket exists and the user is allowed to see it
    db_ticket = crud.get_ticket(db, ticket_id=ticket_id, user_id=user.id, role=user.role)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Register a per-connection queue
    queue: asyncio.Queue = asyncio.Queue(maxsize=50)
    ticket_subscribers.setdefault(ticket_id, []).append(queue)

    async def event_generator():
        try:
            while True:
                try:
                    # Wait up to 15 seconds for a queued update, then send a heartbeat
                    data = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {data}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat to keep the connection alive through proxies / load balancers
                    yield "data: ping\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            # Clean up: remove this queue from the subscriber list
            subs = ticket_subscribers.get(ticket_id, [])
            if queue in subs:
                subs.remove(queue)
            if not subs:
                ticket_subscribers.pop(ticket_id, None)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering if behind a proxy
        },
    )
