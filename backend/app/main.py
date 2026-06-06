from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import tickets, analytics, customers, auth, agents, feedback
from .dependencies import get_current_user
import os
# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Ticket Routing Agent API",
    description="Backend API for managing support tickets",
    version="1.0.0"
)

# Configure CORS so the React frontend can communicate with the backend
origins = os.environ.get(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
# Note: tickets router manages its own per-route auth so the SSE endpoint
# can accept the JWT as a query param (EventSource cannot send custom headers).
app.include_router(tickets.router)
app.include_router(agents.router, dependencies=[Depends(get_current_user)])
app.include_router(analytics.router, dependencies=[Depends(get_current_user)])
app.include_router(customers.router, dependencies=[Depends(get_current_user)])
app.include_router(auth.router)
app.include_router(feedback.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Ticket Routing Agent API"}
