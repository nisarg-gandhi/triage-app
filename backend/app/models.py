from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    customer_name = Column(String(100), index=True)
    customer_email = Column(String(100), index=True)
    subject = Column(String(200))
    message = Column(Text)
    status = Column(String(50), default="open") # e.g., open, in_progress, resolved
    category = Column(String(50), nullable=True)
    urgency = Column(String(50), nullable=True)
    sentiment = Column(String(50), nullable=True)
    confidence = Column(Float, nullable=True)
    routing_reasoning = Column(Text, nullable=True)
    needs_review = Column(Boolean, default=False)
    ai_draft_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="tickets")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tickets = relationship("Ticket", back_populates="user")
