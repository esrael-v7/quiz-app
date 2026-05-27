# QuizApp Architecture

## System Overview

This is a full-stack quiz application with:
- **Frontend**: Android mobile application
- **Backend**: Node.js Express REST API
- **Database**: PostgreSQL database

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Android App (Frontend)                │
│  - User authentication (Google Sign-In)                 │
│  - Quiz interface                                        │
│  - Admin dashboard                                       │
│  - Password Recovery (OTP)                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js Backend (Express API)              │
│  - User authentication (JWT)                             │
│  - Quiz management & submission                          │
│  - Admin endpoints                                       │
│  - Email notifications                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ SQL queries
                       ▼
┌─────────────────────────────────────────────────────────┐
│                PostgreSQL Database                      │
│  - Users table (clients)                                 │
│  - Admin users table                                     │
│  - Questions table                                       │
│  - Quiz attempts table                                   │
│  - Quiz results table                                    │
└─────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Authentication Flow
```
Android App → Backend (/api/auth/login) → PostgreSQL
           ← JWT Token ←
```

### 2. Quiz Taking Flow
```
Android App → Backend (/api/quiz/start) → PostgreSQL (fetch questions)
           ← Questions ←
           
User answers → Backend (/api/quiz/submit) → PostgreSQL (store results)
            ← Score/Results ←
```

### 3. Google Sign-In Flow
```
Android App → Google OAuth → Backend (/api/auth/google) → PostgreSQL
           ← JWT Token ←
```

### 4. Admin Operations
```
Android Admin → Backend (/api/admin/questions) → PostgreSQL (CRUD)
             ← Confirmation ←
```

## Technology Stack

| Layer | Technology |
|-------|----------|
| Frontend | Android (Java/Kotlin) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | Google OAuth 2.0, JWT |
| Email | Nodemailer |
| Security | Helmet, CORS, Rate Limiting, bcryptjs |
| DevOps | Docker, Docker Compose |

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Rate Limiting**: Prevents brute-force attacks
3. **Helmet**: Sets secure HTTP headers
4. **CORS**: Controlled cross-origin requests
5. **Password Hashing**: bcryptjs for secure password storage
6. **Input Validation**: Joi for schema validation
7. **SQL Injection Prevention**: Parameterized queries via pg library

## Database Schema

### Users (Clients)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Questions
```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL,
    category VARCHAR(50),
    created_by INT REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Quiz Attempts
```sql
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    question_id INT REFERENCES questions(id),
    selected_answer CHAR(1),
    is_correct BOOLEAN,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment Strategy

### Local Development
```bash
docker-compose up
```

### Staging/Production
1. Android: Build signed APK/AAB for Google Play Store
2. Backend: Deploy to cloud platform (Heroku, AWS, DigitalOcean, etc.)
3. Database: Use managed PostgreSQL service (AWS RDS, Heroku Postgres, etc.)
4. Domain: Set up custom domain with SSL/TLS

## Performance Considerations

1. **Database Indexing**: Index frequently queried columns
2. **Caching**: Implement Redis for frequently accessed data
3. **Connection Pooling**: Use PgBouncer or similar
4. **API Response Pagination**: Limit large result sets
5. **Compression**: Enable gzip compression in Express
