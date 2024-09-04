// authMiddleware.js
function ensureAuthenticated(req, res, next) {
  if (!req.session.accessToken) {
      return res.redirect('/');
  }
  next();
}

module.exports = ensureAuthenticated;
