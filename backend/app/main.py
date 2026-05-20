from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import tickets, analytics, customers

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Ticket Routing Agent API",
    description="Backend API for managing support tickets",
    version="1.0.0"
)

# Configure CORS so the React frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Add your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(tickets.router)
app.include_router(analytics.router)
app.include_router(customers.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Ticket Routing Agent API"}
