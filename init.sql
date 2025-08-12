-- Initialize the time tracker database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (PostgreSQL creates the database specified in POSTGRES_DB environment variable)

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE time_tracker_db TO postgres;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 