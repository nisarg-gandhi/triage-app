from sqlalchemy.orm import Session
from sqlalchemy import or_
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
