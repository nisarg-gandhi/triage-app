from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
)

@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    """
    Get aggregated customer data based on existing tickets.
    """
    return crud.get_aggregated_customers(db)
