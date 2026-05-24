from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL database URL from environment variable.
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is missing. A valid PostgreSQL connection string is required.")

# Create the engine, omitting SQLite specific connect_args
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal class will be a database session factory.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models.
Base = declarative_base()

# Dependency to get a database session for a request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
