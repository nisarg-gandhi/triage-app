from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional

# Schema for creating a ticket (what we expect from the client)
class TicketCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr # Validates email format
    subject: str
    message: str

# Schema for updating a ticket's status
class TicketUpdateStatus(BaseModel):
    status: str

    @field_validator('status')
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {'open', 'in_progress', 'resolved'}
        if v.lower() not in allowed:
            raise ValueError(f'Status must be one of {allowed}')
        return v.lower()


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
    confidence: Optional[float] = None
    routing_reasoning: Optional[str] = None
    needs_review: Optional[bool] = None
    ai_draft_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # Allows Pydantic to read data from SQLAlchemy ORM models

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
