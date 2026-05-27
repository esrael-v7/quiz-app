# QuizApp - Full Stack Project

A complete quiz application combining Android UI with Node.js backend.

## 📁 Project Structure

```
quiz-app-full/
├── android/                 # Android Studio Project (QuizApp)
│   ├── app/
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   └── README.md
│
├── backend/                 # Node.js Backend (Express API)
│   ├── src/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── docs/                    # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SETUP.md
│
├── docker-compose.yml       # Local development setup
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Android**: Android Studio, JDK 11+
- **Backend**: Node.js 14+, npm or yarn
- **Docker**: Optional (for containerized setup)

### Development Setup

#### Android App
```bash
cd android
# Open in Android Studio or build via command line
./gradlew build
```

#### Backend Server
```bash
cd backend
npm install
npm run dev
```

#### Using Docker
```bash
docker-compose up
```

## 📱 Android App Features
- Google Sign-In authentication
- Password Recovery with OTP
- Admin Dashboard for managing questions
- Real-time quiz taking
- Smooth UI transitions

## 🔗 API Endpoints
See `docs/API.md` for detailed API documentation.

## 🏗️ Architecture
See `docs/ARCHITECTURE.md` for system design and integration details.

## 👥 Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📝 License
MIT License

---

**Last Updated**: May 27, 2026
