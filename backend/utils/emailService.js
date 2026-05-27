const nodemailer = require('nodemailer');

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env.');
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT, 10) || 465,
        secure: process.env.EMAIL_SECURE === 'true' || true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    console.log(`Sending password reset email to ${to}`);

    const transporter = createTransporter();
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    });

    console.log(`Email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
};

module.exports = { sendEmail };
