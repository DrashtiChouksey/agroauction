const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/email.service');
const crypto = require('crypto');

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('kisanbid_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  if (refreshToken) {
    res.cookie('kisanbid_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
  }
};

class AuthController {
  async register(req, res) {
    try {
      const { email, password, role, name } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.validationError(res, 'Email already in use', 'email');
      }

      const user = await User.create({
        ...req.body,
        emailVerified: false
      });

      // Send welcome email async
      sendWelcomeEmail(user).catch(console.error);

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      setTokenCookies(res, accessToken, refreshToken);

      return ApiResponse.created(res, { user, token: accessToken }, 'Registration successful');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password +refreshToken');
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      if (user.status === 'banned') {
        return ApiResponse.forbidden(res, `Account banned: ${user.bannedReason || 'Policy violation'}`);
      }

      if (user.status === 'suspended' && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
        return ApiResponse.forbidden(res, `Account suspended until ${user.suspendedUntil}`);
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, 'Invalid credentials');
      }

      user.lastActive = new Date();

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      setTokenCookies(res, accessToken, refreshToken);

      return ApiResponse.success(res, { user, token: accessToken }, 'Login successful');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async adminLogin(req, res) {
    try {
      const { email, password, secretCode } = req.body;

      if (secretCode !== process.env.ADMIN_SECRET_CODE) {
        return ApiResponse.unauthorized(res, 'Invalid admin code');
      }

      const user = await User.findOne({ email, role: 'admin' }).select('+password +refreshToken');
      if (!user) {
        return ApiResponse.unauthorized(res, 'Invalid admin credentials');
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, 'Invalid admin credentials');
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      user.lastActive = new Date();
      await user.save();

      setTokenCookies(res, accessToken, refreshToken);

      return ApiResponse.success(res, { user, token: accessToken }, 'Admin login successful');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async googleCallback(req, res) {
    try {
      // req.user is set by passport
      const user = req.user;
      
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      setTokenCookies(res, accessToken, refreshToken);

      // Redirect back to frontend
      const redirectUrl = user.role === 'admin' 
        ? `${process.env.CLIENT_URL_ADMIN}/auth-success?token=${accessToken}`
        : `${process.env.CLIENT_URL_PLATFORM}/auth-success?token=${accessToken}`;
        
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL_PLATFORM}/login?error=oauth_failed`);
    }
  }

  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.kisanbid_refresh_token || req.body.refreshToken;

      if (!refreshToken) {
        return ApiResponse.unauthorized(res, 'Refresh token required');
      }

      try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
          return ApiResponse.unauthorized(res, 'Invalid refresh token');
        }

        const accessToken = generateAccessToken(user);
        
        res.cookie('kisanbid_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return ApiResponse.success(res, { token: accessToken }, 'Token refreshed');
      } catch (err) {
        return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
      }
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async logout(req, res) {
    try {
      if (req.user) {
        await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });
      }

      res.clearCookie('kisanbid_token');
      res.clearCookie('kisanbid_refresh_token');

      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      return ApiResponse.success(res, { user });
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Return success even if user doesn't exist for security
        return ApiResponse.success(res, null, 'If that email exists, a reset link was sent.');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

      await user.save();

      const clientUrl = user.role === 'admin' ? process.env.CLIENT_URL_ADMIN : process.env.CLIENT_URL_PLATFORM;
      const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

      sendPasswordResetEmail(user, resetUrl).catch(console.error);

      return ApiResponse.success(res, null, 'Password reset email sent');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async resetPassword(req, res) {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      }).select('+password');

      if (!user) {
        return ApiResponse.validationError(res, 'Token is invalid or has expired');
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      return ApiResponse.success(res, null, 'Password reset successful');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  // === OTP Methods ===
  async sendOTP(req, res) {
    try {
      const { email, phone, purpose } = req.body;
      const { generateOTP, storeOTP } = require('../utils/otpHelper');
      const { sendEmail } = require('../services/email.service');

      const otp = generateOTP();
      const key = email || phone;

      if (!key) {
        return ApiResponse.validationError(res, 'Email or phone is required');
      }

      storeOTP(key, otp);

      if (email) {
        await sendEmail(email, 'KISAN BID - Your OTP Code', `
          <h2>Your OTP Code</h2>
          <p>Your verification code is: <b style="font-size:24px;letter-spacing:6px">${otp}</b></p>
          <p>This code expires in 10 minutes.</p>
        `);
      }

      // For phone OTP in dev, we log it (in production, use Twilio/MSG91)
      if (phone) {
        console.log(`[DEV] Phone OTP for ${phone}: ${otp}`);
      }

      // In dev mode, return OTP in response for testing convenience
      const responseData = process.env.NODE_ENV === 'development' ? { otp, expiresIn: '10 minutes' } : { expiresIn: '10 minutes' };
      return ApiResponse.success(res, responseData, `OTP sent to ${email ? 'email' : 'phone'}`);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async verifyOTP(req, res) {
    try {
      const { email, phone, otp } = req.body;
      const { verifyOTP: checkOTP } = require('../utils/otpHelper');

      const key = email || phone;
      if (!key || !otp) {
        return ApiResponse.validationError(res, 'Email/phone and OTP are required');
      }

      const result = checkOTP(key, otp);
      if (!result.valid) {
        return ApiResponse.validationError(res, result.message);
      }

      // If user exists, mark email as verified
      if (email) {
        await User.findOneAndUpdate({ email }, { emailVerified: true });
      }

      return ApiResponse.success(res, { verified: true }, 'OTP verified successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new AuthController();
