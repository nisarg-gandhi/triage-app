from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Schema for creating a ticket (what we expect from the client)
class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr # Validates email format
    subject: str
    message: str

# Schema for returning a ticket (what we send back to the client)
class Ticket(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    subject: str
    message: str
    status: str
    category: Optional[str] = None
    urgency: Optional[str] = None
    sentiment: Optional[str] = None
    ai_draft_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read data from SQLAlchemy ORM models
