# QuizApp API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All endpoints (except login/register/google-auth) require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "error_code": "ERROR_CODE"
}
```

---

## Auth Endpoints

### POST /auth/register
Register a new user
```json
Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "status": "success",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### POST /auth/login
User login
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### POST /auth/google
Google Sign-In
```json
Request:
{
  "token": "google_id_token_from_android",
  "username": "john_doe"
}

Response (200):
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john@gmail.com",
    "username": "john_doe"
  }
}
```

### POST /auth/forgot-password
Request password reset OTP
```json
Request:
{
  "email": "john@example.com"
}

Response (200):
{
  "status": "success",
  "message": "OTP sent to your email"
}
```

### POST /auth/verify-otp
Verify OTP and reset password
```json
Request:
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "NewPassword123!"
}

Response (200):
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

## Quiz Endpoints

### GET /quiz/list
Get all available quizzes
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "quizzes": [
    {
      "id": 1,
      "title": "General Knowledge",
      "description": "Test your GK",
      "question_count": 10,
      "duration_minutes": 30
    }
  ]
}
```

### GET /quiz/:quiz_id/questions
Get questions for a quiz
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "questions": [
    {
      "id": 1,
      "question_text": "What is the capital of France?",
      "option_a": "London",
      "option_b": "Paris",
      "option_c": "Berlin",
      "option_d": "Rome"
    }
  ]
}
```

### POST /quiz/:quiz_id/submit
Submit quiz answers
```json
Headers: Authorization: Bearer <token>

Request:
{
  "answers": [
    {
      "question_id": 1,
      "selected_answer": "b"
    },
    {
      "question_id": 2,
      "selected_answer": "a"
    }
  ]
}

Response (200):
{
  "status": "success",
  "result": {
    "score": 9,
    "total_questions": 10,
    "percentage": 90,
    "correct_answers": 9,
    "wrong_answers": 1
  }
}
```

---

## User Endpoints

### GET /user/profile
Get user profile
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2026-05-27T12:00:00Z"
  }
}
```

### GET /user/results
Get user's quiz results
```
Headers: Authorization: Bearer <token>

Response (200):
{
  "status": "success",
  "results": [
    {
      "id": 1,
      "quiz_id": 1,
      "score": 90,
      "percentage": 90,
      "attempted_at": "2026-05-27T12:30:00Z"
    }
  ]
}
```

---

## Admin Endpoints

### GET /admin/questions
Get all questions (Admin only)
```
Headers: Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "questions": [ ... ]
}
```

### POST /admin/questions
Create new question (Admin only)
```json
Headers: Authorization: Bearer <admin_token>

Request:
{
  "question_text": "What is the capital of France?",
  "option_a": "London",
  "option_b": "Paris",
  "option_c": "Berlin",
  "option_d": "Rome",
  "correct_answer": "b",
  "category": "Geography"
}

Response (201):
{
  "status": "success",
  "question_id": 1,
  "message": "Question created successfully"
}
```

### PUT /admin/questions/:question_id
Update question (Admin only)
```json
Headers: Authorization: Bearer <admin_token>

Request: (same as POST /admin/questions)

Response (200):
{
  "status": "success",
  "message": "Question updated successfully"
}
```

### DELETE /admin/questions/:question_id
Delete question (Admin only)
```
Headers: Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "message": "Question deleted successfully"
}
```

### GET /admin/users
Get all users (Admin only)
```
Headers: Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "users": [ ... ]
}
```

### GET /admin/analytics
Get platform analytics (Admin only)
```
Headers: Authorization: Bearer <admin_token>

Response (200):
{
  "status": "success",
  "analytics": {
    "total_users": 100,
    "total_quizzes_taken": 500,
    "average_score": 75.5
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|----------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
