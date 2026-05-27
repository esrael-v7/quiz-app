# QuizApp - Full Stack Setup Guide

## Prerequisites

### For Android Development
- Android Studio (Flamingo or later)
- JDK 11 or higher
- Android SDK (API level 23+)
- Git

### For Backend Development  
- Node.js 14+ (recommend 16 LTS)
- npm or yarn
- PostgreSQL 12+ (or use Heroku Postgres)
- Git

### Optional
- Docker & Docker Compose
- Postman (for API testing)
- Visual Studio Code

---

## Project Structure

```
quiz-app/
├── android/              # Android Studio Project
│   ├── app/
│   ├── gradle/
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── README.md
├── backend/              # Node.js Express Backend
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── config/
│   ├── utils/
│   ├── package.json
│   ├── server.js
│   └── .env
├── docs/                 # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SETUP.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick Start (Using Docker)

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/esrael-v7/quiz-app.git
cd quiz-app
```

2. **Start all services**
```bash
docker-compose up
```

This will start:
- Backend API on `http://localhost:5000`
- PostgreSQL on `localhost:5432`

3. **Run database migrations** (in another terminal)
```bash
docker-compose exec backend node backend/migrateDb.js
```

4. **Create admin user**
```bash
docker-compose exec backend node backend/createAdmin.js
```

5. **Seed sample data** (optional)
```bash
docker-compose exec backend node backend/seedExpanded.js
```

---

## Manual Setup (No Docker)

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=1d

# PostgreSQL Connection
DB_CLIENT_HOST=localhost
DB_CLIENT_USER=quiz_app_client
DB_CLIENT_PASSWORD=client_secure_password
DB_CLIENT_NAME=quiz_app_db

DB_ADMIN_HOST=localhost
DB_ADMIN_USER=quiz_admin_user
DB_ADMIN_PASSWORD=admin_secure_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Email Settings
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

4. **Create PostgreSQL database**
```bash
psql -U postgres
```

In psql:
```sql
CREATE DATABASE quiz_app_db;
CREATE USER quiz_app_client WITH PASSWORD 'client_secure_password';
GRANT ALL PRIVILEGES ON DATABASE quiz_app_db TO quiz_app_client;
```

5. **Run migrations**
```bash
node migrateDb.js
```

6. **Create admin user**
```bash
node createAdmin.js
```

7. **Start backend server**
```bash
npm run dev
```

Backend will run at `http://localhost:5000`

### Android Setup

1. **Open Android Studio**
   - File → Open
   - Select the `android` folder

2. **Wait for Gradle sync**
   - Android Studio will automatically sync Gradle files

3. **Configure Backend URL**
   - Open `android/app/src/main/java/com/example/quizapp/utils/ApiClient.java`
   - Update `BASE_URL` to your backend URL

   For local development:
   ```java
   public static final String BASE_URL = "http://192.168.x.x:5000/api/";
   ```
   Replace `192.168.x.x` with your machine's IP address

4. **Configure Google Sign-In**
   - Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Update `google_web_client_id` in Android app

5. **Run the app**
   - Click "Run" or press Shift + F10

---

## API Testing

### Using Postman

1. **Import Postman Collection**
   - Open Postman
   - Click "Import"
   - Select `QuizApp_Postman_Collection.json` from root directory

2. **Set up environment variables**
   - Create new Environment
   - Set `base_url` = `http://localhost:5000/api`
   - Set `token` = (will be set after login)

3. **Test endpoints**
   - Register a new user
   - Login to get JWT token
   - Get quiz list
   - Submit quiz answers

### Using cURL

1. **Health check**
```bash
curl http://localhost:5000/api/health
```

2. **Register user**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

3. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

---

## Development Workflow

### Working on Backend

1. **Create a feature branch**
```bash
cd backend
git checkout -b feature/new-feature
```

2. **Make changes and test**
```bash
npm run dev  # Auto-reloads on file changes
```

3. **Commit and push**
```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

4. **Create Pull Request**

### Working on Android

1. **Create a feature branch**
```bash
cd android
git checkout -b feature/new-ui
```

2. **Build and test**
```bash
./gradlew build
./gradlew connectedAndroidTest
```

3. **Commit and push**
```bash
git add .
git commit -m "Add new UI"
git push origin feature/new-ui
```

4. **Create Pull Request**

---

## Common Issues

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -rf backend/node_modules package-lock.json
cd backend
npm install
npm run dev
```

### PostgreSQL connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify username/password credentials
- Check database exists

### Android emulator can't connect to backend
- Use your machine's IP instead of localhost
- Check firewall settings
- Ensure backend is running
- Check ApiClient.java BASE_URL configuration

### Port 5000 already in use
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Docker containers won't start
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## Deployment

### Android App
1. Build release APK
2. Sign with your keystore
3. Upload to Google Play Store

### Backend
1. Create account on cloud platform (Heroku, AWS, DigitalOcean, etc.)
2. Set environment variables
3. Deploy code
4. Set up database
5. Configure domain and SSL

See `docs/ARCHITECTURE.md` for more details.

---

## Documentation

- **API**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Android README**: See `android/README.md`
- **Backend README**: See `backend/README.md`

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new GitHub issue with detailed description
3. Provide logs and error messages

---

## Next Steps

✅ Local development setup complete!

**Recommended next actions:**
1. Test API with Postman collection
2. Run Android app in emulator
3. Create admin user for testing
4. Test Google Sign-In integration
5. Deploy to production

---

Happy coding! 🚀
