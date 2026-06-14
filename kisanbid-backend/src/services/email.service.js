const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com')) {
    logger.info(`Mock Email sent to: ${to}, Subject: ${subject}`);
    return true;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `KISAN BID <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed:', error);
    return false;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to KISAN BID, ${user.name}!</h1>
    <p>We are thrilled to have you on our platform as a ${user.role}.</p>
    <p>Start exploring ${user.role === 'farmer' ? 'listing your crops' : 'bidding on high-quality crops'} today.</p>
  `;
  return sendEmail(user.email, 'Welcome to KISAN BID!', html);
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password. This link is valid for 1 hour.</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  return sendEmail(user.email, 'Password Reset - KISAN BID', html);
};

const sendAuctionWinnerEmail = async (user, crop, finalPrice) => {
  const html = `
    <h1>Congratulations ${user.name}!</h1>
    <p>You have won the auction for <b>${crop.cropName}</b>.</p>
    <p>Final Price: ₹${finalPrice}</p>
    <p>Please log in to your account to view the transaction details and contact the seller.</p>
  `;
  return sendEmail(user.email, `You won the auction: ${crop.cropName}`, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAuctionWinnerEmail,
};
