const { getCredentials, setCredentials } = require('../config/oauth');

const requireAuth = (req, res, next) => {
  // Check session for stored tokens
  if (req.session && req.session.tokens) {
    setCredentials(req.session.tokens);
    return next();
  }

  const creds = getCredentials();
  if (creds && creds.access_token) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Visit /auth/login first.',
    loginUrl: '/auth/login',
  });
};

module.exports = { requireAuth };
