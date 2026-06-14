const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} = require('../validators/auth.validator');

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/admin/login', authLimiter, validate(adminLoginSchema), authController.adminLogin);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

// OTP routes
router.post('/send-otp', authLimiter, authController.sendOTP);
router.post('/verify-otp', authLimiter, authController.verifyOTP);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback);

module.exports = router;
