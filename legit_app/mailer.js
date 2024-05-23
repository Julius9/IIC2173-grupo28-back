// mailer.js
const nodemailer = require('nodemailer');
// const path = require('path');

// Configura el transportador de correo
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    }
    
});
module.exports = transporter;
