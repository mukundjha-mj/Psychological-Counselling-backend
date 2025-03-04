const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const isValidSMTPConfig = () => {
    const requiredSettings = {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        port: process.env.SMTP_PORT
    };
    
    for (const [key, value] of Object.entries(requiredSettings)) {
        if (!value || 
            value.includes('example.com') || 
            value === 'your_password' ||
            value === 'your_email@example.com') {
            console.warn(`Invalid SMTP ${key}: ${value}`);
            return false;
        }
    }
    
    return true;
};

const verifyEmailConfig = async () => {
    if (!isValidSMTPConfig()) {
        console.warn('Email service disabled: Missing or invalid SMTP configuration');
        return false;
    }
    
    try {
        await transporter.verify();
        console.log('Email service ready');
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
};

module.exports = {
    transporter,
    verifyEmailConfig,
};