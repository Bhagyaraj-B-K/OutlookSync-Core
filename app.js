require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const passport = require("./auth");
const ensureAuthenticated = require("./middlewares/authMiddleware");
const userService = require("./services/userService");
const setupIndices = require("./services/setupIndices");
const dbMigration = require("./migration");

const app = express();
setupIndices();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-strong-secret-key",
    resave: false, // Don't save the session if it hasn't been modified
    saveUninitialized: true, // Save a session even if it's uninitialized
    cookie: { secure: false }, // Set to true if you're using HTTPS
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get("/home", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname + "/public/home.html"));
});

app.get("/user", ensureAuthenticated, async (req, res) => {
  const { id } = req.session.user;
  const user = await userService.getUserById(id);
  res.send(user);
});

app.post("/sync-email", ensureAuthenticated, async (req, res) => {
  const { id } = req.session.user;
  const user = await userService.syncEmails(req.session.accessToken,id);
  res.send(user);
});

app.get("/emails", ensureAuthenticated, async (req, res) => {
  const { id } = req.session.user;
  const emails = await userService.getEmails(id);
  res.send(emails);
})

// Outlook authentication routes
app.get("/auth/outlook", passport.authenticate("windowslive"));

app.get(
  "/auth/outlook/callback",
  passport.authenticate("windowslive", { failureRedirect: "/" }),
  (req, res) => {
    // Store tokens in the session after authentication
    req.session.accessToken = req.user.accessToken;
    req.session.refreshToken = req.user.refreshToken;
    req.session.user = req.user.profile;
    // Successful authentication, redirect to the desired page
    res.redirect("/home");
  }
);

dbMigration();
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
