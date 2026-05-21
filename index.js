require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if not exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://youtube-dasahboard-frontend.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'kundan_yt_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));

// ─── Routes ───────────────────────────────────────────────────────
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Home - show available endpoints
app.get('/', (req, res) => {
  res.json({
    name: '🎬 YouTube Manager - Kundan AI Studio',
    status: 'running',
    endpoints: {
      auth: {
        'GET /auth/login': 'Start OAuth flow',
        'GET /auth/callback': 'OAuth callback (auto)',
        'GET /auth/status': 'Check auth status',
        'GET /auth/logout': 'Logout',
      },
      analytics: {
        'GET /api/analytics/overview': 'Views, watch time, subs (query: startDate, endDate)',
        'GET /api/analytics/daily': 'Day-by-day breakdown',
        'GET /api/analytics/top-videos': 'Top videos by views (query: startDate, limit)',
      },
      videos: {
        'GET /api/videos/list': 'List your videos (query: maxResults, order)',
        'GET /api/videos/:videoId': 'Get video details + stats',
        'PATCH /api/videos/:videoId': 'Update title/description/tags',
        'POST /api/videos/:videoId/thumbnail': 'Upload new thumbnail (multipart)',
      },
      playlists: {
        'GET /api/playlists': 'List all playlists',
        'POST /api/playlists': 'Create new playlist',
        'GET /api/playlists/:id/videos': 'List videos in playlist',
        'POST /api/playlists/:id/videos': 'Add video to playlist',
        'DELETE /api/playlists/:id/videos/:itemId': 'Remove video from playlist',
      },
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 YouTube Manager running at http://localhost:${PORT}`);
  console.log(`📋 Visit http://localhost:${PORT}/auth/login to authenticate`);
});
