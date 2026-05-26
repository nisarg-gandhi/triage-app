from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io

from .. import schemas, crud, models
from ..database import get_db
from ..dependencies import get_current_user, require_role

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)

@router.post("/", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Create a new ticket.
    """
    return crud.create_ticket(db=db, ticket=ticket, user_id=current_user.id)

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
    Retrieve all tickets belonging to the current user where needs_review is True and status is "open".
    """
    tickets = db.query(models.Ticket).filter(
        models.Ticket.user_id == current_user.id,
        models.Ticket.needs_review == True,
        models.Ticket.status == "open"
    ).order_by(models.Ticket.id.desc()).offset(skip).limit(limit).all()
    return tickets

@router.get("/{ticket_id}", response_model=schemas.Ticket)
def read_ticket(ticket_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Retrieve a specific ticket by ID.
    """
    db_ticket = crud.get_ticket(db, ticket_id=ticket_id, user_id=current_user.id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@router.patch("/{ticket_id}/status", response_model=schemas.Ticket)
def update_ticket_status(ticket_id: int, status_update: schemas.TicketUpdateStatus, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Update the status of a specific ticket.
    """
    db_ticket = crud.update_ticket_status(db, ticket_id=ticket_id, status=status_update.status, user_id=current_user.id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket
