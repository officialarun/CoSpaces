const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');
const notificationController = require('../controllers/notification.controller');
const logger = require('../utils/logger');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true, // Enable passing request to callback
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('=== Google OAuth Callback ===');
          console.log('Google Profile ID:', profile.id);
          console.log('Email:', profile.emails[0]?.value);
          console.log('Name:', profile.name.givenName, profile.name.familyName);

          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log('✅ User found by Google ID:', user.email);
            console.log('User Role:', user.role);
            console.log('Is Active:', user.isActive);
            
            // Check if user is deactivated
            if (!user.isActive) {
              console.error('❌ User account is deactivated');
              return done(new Error('Account is deactivated'), null);
            }
            
            // User exists, return user
            return done(null, user);
          }

          // Check if email already exists (user might have signed up with email/password)
          const email = profile.emails[0].value;
          user = await User.findOne({ email });

          if (user) {
            console.log('✅ User found by email, linking Google account:', email);
            console.log('User Role:', user.role);
            console.log('Is Active:', user.isActive);
            
            // Check if user is deactivated
            if (!user.isActive) {
              console.error('❌ User account is deactivated');
              return done(new Error('Account is deactivated'), null);
            }
            
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.avatar = profile.photos[0]?.value;
            user.isEmailVerified = true; // Google emails are verified
            // Ensure phone field exists (initialize if missing)
            if (user.phone === undefined) {
              user.phone = null;
              user.isPhoneVerified = false;
            }
            await user.save();
            console.log('✅ Google account linked successfully');
            return done(null, user);
          }

          // Create new user
          console.log('📝 Creating new user:', email);
          const newUser = await User.create({
            googleId: profile.id,
            authProvider: 'google',
            email: email,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            userType: 'individual',
            role: 'investor',
            avatar: profile.photos[0]?.value,
            isEmailVerified: true,
            phone: null, // Initialize phone field (null for OAuth users, will be added later)
            isPhoneVerified: false, // Initialize phone verification status
            consents: {
              termsAccepted: true,
              termsAcceptedAt: new Date(),
              privacyPolicyAccepted: true,
              privacyPolicyAcceptedAt: new Date()
            }
          });
          console.log('✅ New user created:', newUser.email);

          // Send welcome email (non-blocking)
          notificationController.sendWelcomeEmail(newUser).catch(err =>
            logger.error('Failed to send welcome email (Google OAuth)', { userId: newUser._id, error: err.message })
          );

          done(null, newUser);
        } catch (error) {
          console.error('❌ Google OAuth Error:', error.message);
          console.error('Error Stack:', error.stack);
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

