from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud
from ..database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """
    Get overview statistics for the dashboard.
    """
    return crud.get_analytics_overview(db)

@router.get("/charts")
def get_analytics_charts(db: Session = Depends(get_db)):
    """
    Get data for dashboard charts.
    """
    return crud.get_analytics_charts(db)
