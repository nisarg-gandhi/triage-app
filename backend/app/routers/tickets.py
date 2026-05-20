from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from .. import schemas, crud
from ..database import get_db

router = APIRouter(
    prefix="/tickets",
    tags=["tickets"],
)

@router.post("/", response_model=schemas.Ticket)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    """
    Create a new ticket.
    """
    return crud.create_ticket(db=db, ticket=ticket)

@router.get("/", response_model=List[schemas.Ticket])
def read_tickets(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all tickets with optional pagination and filtering.
    """
    tickets = crud.get_tickets(
        db, 
        skip=skip, 
        limit=limit,
        search=search,
        status=status,
        category=category,
        urgency=urgency
    )
    return tickets

@router.get("/{ticket_id}", response_model=schemas.Ticket)
def read_ticket(ticket_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a specific ticket by ID.
    """
    db_ticket = crud.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@router.patch("/{ticket_id}/status", response_model=schemas.Ticket)
def update_ticket_status(ticket_id: int, status_update: schemas.TicketUpdateStatus, db: Session = Depends(get_db)):
    """
    Update the status of a specific ticket.
    """
    db_ticket = crud.update_ticket_status(db, ticket_id=ticket_id, status=status_update.status)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket
