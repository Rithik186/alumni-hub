-- Drop tables if they exist to recreate
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS mentorship_requests CASCADE;
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS alumni_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'alumni', 'admin')) NOT NULL,
    college VARCHAR(150),
    otp_code VARCHAR(6),
    otp_expiry TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni Profiles
CREATE TABLE alumni_profiles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(100),
    job_role VARCHAR(100),
    batch VARCHAR(10),
    department VARCHAR(50),
    PRIMARY KEY (user_id)
);

-- Student Profiles
CREATE TABLE student_profiles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(50),
    register_number VARCHAR(50) UNIQUE,
    batch VARCHAR(10),
    PRIMARY KEY (user_id)
);

-- Mentorship Requests
CREATE TABLE mentorship_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    alumni_id INT REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(50) CHECK (purpose IN ('resume_review', 'career_guidance', 'interview_prep')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    date TIMESTAMP,
    type VARCHAR(20) CHECK (type IN ('alumni_meet', 'training', 'general')),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
