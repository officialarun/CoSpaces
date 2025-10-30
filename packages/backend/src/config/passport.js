const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, return user
            return done(null, user);
          }

          // Check if email already exists (user might have signed up with email/password)
          const email = profile.emails[0].value;
          user = await User.findOne({ email });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.avatar = profile.photos[0]?.value;
            user.isEmailVerified = true; // Google emails are verified
            await user.save();
            return done(null, user);
          }

          // Create new user
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
            // Phone will be added during KYC - not required for OAuth
            consents: {
              termsAccepted: true,
              termsAcceptedAt: new Date(),
              privacyPolicyAccepted: true,
              privacyPolicyAcceptedAt: new Date()
            }
          });

          done(null, newUser);
        } catch (error) {
          console.error('Google OAuth Error:', error);
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

