-- Drop tables if they exist to recreate
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS mentorship_requests CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
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
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval for alumni
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alumni Profiles
CREATE TABLE alumni_profiles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(100),
    job_role VARCHAR(100),
    batch VARCHAR(10),
    department VARCHAR(50),
    skills TEXT[], -- Array of skills
    experience_level VARCHAR(20), -- Junior, Senior, etc.
    bio TEXT,
    mentorship_available BOOLEAN DEFAULT TRUE,
    career_journey JSONB DEFAULT '[]', -- Array of { year, title, company, description }
    PRIMARY KEY (user_id)
);

-- Student Profiles
CREATE TABLE student_profiles (
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(50),
    register_number VARCHAR(50) UNIQUE,
    batch VARCHAR(10),
    interests TEXT[],
    skills TEXT[],
    placement_status VARCHAR(50),
    resume_url VARCHAR(255),
    PRIMARY KEY (user_id)
);

-- Connections Table (Follow/Connect)
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    requester_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, receiver_id)
);

-- Mentorship Requests
CREATE TABLE mentorship_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    alumni_id INT REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT, -- Resume review, Career guidance, Interview prep
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
    type VARCHAR(20) CHECK (type IN ('alumni_meet', 'training', 'general', 'placement')),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
