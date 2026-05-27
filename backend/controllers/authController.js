const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { clientPool } = require('../config/db');
const { logAction } = require('../utils/auditLogger');
const { sendEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert using client pool
        const { rows } = await clientPool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        const token = generateToken(rows[0].id, 'user');
        
        // Audit log
        await logAction(rows[0].id, 'USER_REGISTER', `User registered: ${email}`, req.ip);

        res.status(201).json({
            status: 'success',
            data: { id: rows[0].id, username, email, role: 'user', token }
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ status: 'fail', message: 'User already exists' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await clientPool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = generateToken(user.id, user.role);
            await logAction(user.id, 'USER_LOGIN', `User logged in`, req.ip);
            
            res.json({
                status: 'success',
                data: { id: user.id, username: user.username, email: user.email, role: user.role, token }
            });
        } else {
            res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Right to Erase implementation
exports.deleteAccount = async (req, res) => {
    const userId = req.user.id;
    try {
        // Since foreign keys use ON DELETE CASCADE, this will delete their history too
        await clientPool.query('DELETE FROM users WHERE id = $1', [userId]);
        await logAction(null, 'USER_ERASED', `User ID ${userId} deleted their account`, req.ip);
        res.json({ status: 'success', message: 'Account and associated data completely erased.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

exports.googleAuth = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ status: 'fail', message: 'idToken is required' });
    }

    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const client = new OAuth2Client(clientId);

        const ticket = await client.verifyIdToken({
            idToken,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        if (!email || !name) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid token: missing email or name'
            });
        }

        const { rows } = await clientPool.query(
            'SELECT id, username, role FROM users WHERE email = $1',
            [email]
        );

        let user;
        if (rows.length > 0) {
            user = rows[0];
            await logAction(user.id, 'USER_GOOGLE_LOGIN', `User logged in via Google`, req.ip);
        } else {
            const { rows: newUserRows } = await clientPool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
                [name, email, '', 'user']
            );
            user = newUserRows[0];
            await logAction(user.id, 'USER_GOOGLE_REGISTER', `User registered via Google`, req.ip);
        }

        const token = generateToken(user.id, user.role);

        res.json({
            status: 'success',
            data: {
                token,
                id: user.id,
                username: user.username,
                email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.message && error.message.includes('Token used too early')) {
            return res.status(401).json({ status: 'fail', message: 'Invalid token: used too early' });
        }
        if (error.message && error.message.includes('Invalid token')) {
            return res.status(401).json({ status: 'fail', message: 'Invalid Google token' });
        }
        res.status(500).json({ status: 'error', message: 'Authentication failed' });
    }
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.forgotPassword = async (req, res) => {
    const email = req.body && req.body.email;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const { rows } = await clientPool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userId = rows[0].id;
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        const insertResult = await clientPool.query(
            'INSERT INTO password_reset_codes (user_id, code, expires_at) VALUES ($1, $2, $3) RETURNING id',
            [userId, otp, expiresAt]
        );

        console.log(`Saved password reset code ID ${insertResult.rows[0].id} for user ${userId} and email ${email}`);
        console.log(`Generated password reset OTP for ${email}: ${otp}`);

        await sendEmail({
            to: email,
            subject: 'QuizApp Password Reset Code',
            text: `Your QuizApp password reset code is: ${otp}. This code expires in 10 minutes.`,
            html: `<p>Your QuizApp password reset code is: <strong>${otp}</strong>.</p><p>This code expires in 10 minutes.</p>`
        });

        res.json({ success: true });
    } catch (error) {
        console.error('forgotPassword error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, new_password } = req.body;

    if (!email || !otp || !new_password) {
        return res.status(400).json({ success: false, message: 'Email, otp, and new_password are required' });
    }

    try {
        const { rows: userRows } = await clientPool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userId = userRows[0].id;
        const { rows: otpRows } = await clientPool.query(
            'SELECT id, expires_at FROM password_reset_codes WHERE user_id = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1',
            [userId, otp]
        );

        if (otpRows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const resetEntry = otpRows[0];
        if (new Date(resetEntry.expires_at) < new Date()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);

        await clientPool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
        await clientPool.query('DELETE FROM password_reset_codes WHERE user_id = $1', [userId]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
