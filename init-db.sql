-- Create the database schema for Time Tracker
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    employee_id TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    clock_in TIMESTAMP,
    lunch_out TIMESTAMP,
    lunch_in TIMESTAMP,
    clock_out TIMESTAMP,
    total_hours TEXT,
    status TEXT NOT NULL DEFAULT 'incomplete',
    flags TEXT[] DEFAULT '{}',
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_periods (
    id SERIAL PRIMARY KEY,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    reserve_start_date TEXT,
    reserve_end_date TEXT
);

-- Insert test user
INSERT INTO users (username, password, name, employee_id) 
VALUES ('admin', 'admin123', 'Admin User', 'EMP001')
ON CONFLICT (username) DO NOTHING;

-- Insert current payroll period
INSERT INTO payroll_periods (start_date, end_date, status)
VALUES (
    (CURRENT_DATE - INTERVAL '7 days')::TEXT,
    (CURRENT_DATE + INTERVAL '7 days')::TEXT,
    'active'
)
ON CONFLICT DO NOTHING;