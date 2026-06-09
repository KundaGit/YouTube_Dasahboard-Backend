const express = require('express');
const router = express.Router();
const { oauth2Client, getAuthUrl, setCredentials } = require('../config/oauth');

// Step 1: Redirect to Google Login
router.get('/login', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});

// Step 2: Google redirects back here with auth code
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: 'No auth code received' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    setCredentials(tokens);
    req.session.tokens = tokens;

    // Save tokens in session for persistence
    req.session.tokens = tokens;
// Save tokens in session for persistence

const accessToken = tokens.access_token;
// res.redirect(`http://localhost:4200/dashboard?token=${accessToken}`);
res.redirect(`https://youtube-dasahboard-frontend.vercel.app/dashboard?token=${accessToken}`);
    // res.json({
    //   success: true,
    //   message: '✅ YouTube authenticated successfully!',
    //   tokens: {
    //     access_token: tokens.access_token ? '****set****' : null,
    //     refresh_token: tokens.refresh_token ? '****set****' : null,
    //     expiry_date: tokens.expiry_date,
    //   },
    // });
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check auth status
router.get('/status', (req, res) => {
  const hasSession = !!(req.session && req.session.tokens);
  res.json({
    authenticated: hasSession,
    message: hasSession ? '✅ Authenticated' : '❌ Not authenticated. Visit /auth/login',
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
