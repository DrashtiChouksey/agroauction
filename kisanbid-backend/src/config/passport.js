const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Only configure Google strategy if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              // Update last active
              user.lastActive = new Date();
              user.googlePhoto = profile.photos?.[0]?.value;
              await user.save();
              return done(null, user);
            }

            // Check if user exists with same email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await User.findOne({ email });
              if (user) {
                // Link Google account
                user.googleId = profile.id;
                user.googlePhoto = profile.photos?.[0]?.value;
                user.emailVerified = true;
                await user.save();
                return done(null, user);
              }
            }

            // Create new user (default to buyer role, can be changed later)
            user = await User.create({
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              googlePhoto: profile.photos?.[0]?.value,
              role: 'buyer', // Default role, user selects on first login
              emailVerified: true,
            });

            logger.info(`New Google OAuth user created: ${user.email}`);
            return done(null, user);
          } catch (err) {
            logger.error('Google OAuth error:', err);
            return done(err, null);
          }
        }
      )
    );
    logger.info('Google OAuth strategy configured');
  } else {
    logger.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID');
  }
};

module.exports = configurePassport;
