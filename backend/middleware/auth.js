// middleware/auth.js - Session authentication middleware

/**
 * Protects routes - redirects unauthenticated users to login
 * Used on all routes that require a logged-in user
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next(); // User is authenticated, proceed
  }
  // API requests get JSON error; page requests get redirect
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  res.redirect('/login');
}

/**
 * Attaches user info to res.locals for use in templates/responses
 * Called on every request after session check
 */
function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    res.locals.userId = req.session.userId;
    res.locals.userName = req.session.userName;
    res.locals.userRole = req.session.userRole || 'admin';
    res.locals.guildTeamId = req.session.guildTeamId || null;
  }
  next();
}

module.exports = { requireAuth, attachUser };
