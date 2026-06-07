const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); // Enables CORS with explicit Authorization header allowed
app.use(express.json({ limit: '10kb' })); // Body parser with size limit

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs (relaxed for testing)
    message: 'Too many requests from this IP, please try again later.',
    skip: (req, res) => {
        // 1. Skip rate limiting for specific frequently-called routes
        if (req.originalUrl && (req.originalUrl.includes('/api/quiz/categories') || req.originalUrl.includes('/api/user/stats'))) {
            return true;
        }

        // 2. Skip rate limiting for local/dev IPs
        const ip = req.ip || req.connection.remoteAddress || '';
        return (
            ip.includes('127.0.0.1') ||
            ip.includes('::1') ||
            ip.includes('10.0.2.2') ||
            ip.includes('192.168.') ||
            ip.includes('10.')
        );
    }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/sync', require('./routes/syncRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
