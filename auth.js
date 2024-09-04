const passport = require("passport");
const OutlookStrategy = require("passport-outlook").Strategy;
const userService = require("./services/userService");

passport.use(
  new OutlookStrategy(
    {
      clientID: process.env.OUTLOOK_CLIENT_ID,
      clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/outlook/callback",
      scope: [
        "openid",
        "profile",
        "offline_access",
        "https://outlook.office.com/mail.read",
      ],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const user = await userService.findOrCreateUser(
          profile.id,
          profile.displayName,
          profile.emails[0].value
        );

        return done(null, { profile: user, accessToken, refreshToken });
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser(function (user, done) {
  done(null, user.profile.id); // Serialize the user ID or another identifier
});

// Deserialize user from the session
passport.deserializeUser(async function (id, done) {
  try {
    const user = await userService.getUserById(id);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
