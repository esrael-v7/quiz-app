-- Quiz Application Database Schema
-- Run this in PostgreSQL psql or pgAdmin

-- Note: In PostgreSQL, you generally create the database first, then connect to it
-- and run the remaining scripts.
-- CREATE DATABASE quiz_app_db;
-- \c quiz_app_db

-- 1. Create separate users for the application (No Root Connection)
-- User for regular app operations (Read-heavy, specific writes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_app_client') THEN
    CREATE ROLE quiz_app_client LOGIN PASSWORD 'client_secure_password';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_admin_user') THEN
    CREATE ROLE quiz_admin_user LOGIN PASSWORD 'admin_secure_password';
  END IF;
END
$$;

-- 2. Tables

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    user_level INTEGER DEFAULT 1,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_option VARCHAR(1) CHECK (correct_option IN ('A', 'B', 'C', 'D')) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_history (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Indexing for Query Optimization
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user ON quiz_history(user_id);

-- 4. Grant Privileges
-- Grant limited privileges to app client
GRANT SELECT, INSERT, UPDATE ON users TO quiz_app_client;
GRANT SELECT ON categories TO quiz_app_client;
GRANT SELECT ON questions TO quiz_app_client;
GRANT SELECT, INSERT ON quiz_history TO quiz_app_client;
GRANT INSERT ON audit_logs TO quiz_app_client;

-- Grant usage on sequences for inserts
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO quiz_app_client;
GRANT USAGE, SELECT ON SEQUENCE quiz_history_id_seq TO quiz_app_client;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO quiz_app_client;

-- Grant broader privileges to admin user
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO quiz_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO quiz_admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON questions TO quiz_admin_user;
GRANT SELECT ON quiz_history TO quiz_admin_user;
GRANT SELECT, INSERT ON audit_logs TO quiz_admin_user;

GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO quiz_admin_user;
GRANT USAGE, SELECT ON SEQUENCE categories_id_seq TO quiz_admin_user;
GRANT USAGE, SELECT ON SEQUENCE questions_id_seq TO quiz_admin_user;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO quiz_admin_user;
