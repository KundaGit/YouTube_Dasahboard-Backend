const { getCredentials, setCredentials } = require('../config/oauth');
const { google } = require('googleapis');
const { oauth2Client } = require('../config/oauth');

const requireAuth = (req, res, next) => {
  // Bearer token check (production - cross domain)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    oauth2Client.setCredentials({ access_token: token });
    return next();
  }

  // Session check (localhost)
  if (req.session && req.session.tokens) {
    setCredentials(req.session.tokens);
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Not authenticated. Visit /auth/login first.',
    loginUrl: '/auth/login',
  });
};

module.exports = { requireAuth };