const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');

// Multer for thumbnail uploads
const upload = multer({ dest: 'uploads/' });

// Controllers
const analyticsCtrl = require('../controllers/analytics');
const videoCtrl = require('../controllers/videos');
const playlistCtrl = require('../controllers/playlists');

// ─── Analytics Routes ────────────────────────────────────────────
// GET /api/analytics/overview?startDate=2026-01-01&endDate=2026-05-18
router.get('/analytics/overview', requireAuth, analyticsCtrl.getOverview);

// GET /api/analytics/daily?startDate=2026-05-01&endDate=2026-05-18
router.get('/analytics/daily', requireAuth, analyticsCtrl.getDailyStats);

// GET /api/analytics/top-videos?startDate=2026-01-01&limit=10
router.get('/analytics/top-videos', requireAuth, analyticsCtrl.getTopVideos);

// ─── Video Routes ─────────────────────────────────────────────────
// GET /api/videos/list?maxResults=20&order=date
router.get('/videos/list', requireAuth, videoCtrl.listVideos);

// GET /api/videos/:videoId
router.get('/videos/:videoId', requireAuth, videoCtrl.getVideoDetails);

// PATCH /api/videos/:videoId  { title, description, tags }
router.patch('/videos/:videoId', requireAuth, videoCtrl.updateVideoMetadata);

// POST /api/videos/:videoId/thumbnail  (multipart: thumbnail file)
router.post('/videos/:videoId/thumbnail', requireAuth, upload.single('thumbnail'), videoCtrl.updateThumbnail);

// ─── Playlist Routes ──────────────────────────────────────────────
// GET /api/playlists
router.get('/playlists', requireAuth, playlistCtrl.listPlaylists);

// POST /api/playlists  { title, description, privacyStatus }
router.post('/playlists', requireAuth, playlistCtrl.createPlaylist);

// GET /api/playlists/:playlistId/videos
router.get('/playlists/:playlistId/videos', requireAuth, playlistCtrl.getPlaylistVideos);

// POST /api/playlists/:playlistId/videos  { videoId, position }
router.post('/playlists/:playlistId/videos', requireAuth, playlistCtrl.addVideoToPlaylist);

// DELETE /api/playlists/:playlistId/videos/:playlistItemId
router.delete('/playlists/:playlistId/videos/:playlistItemId', requireAuth, playlistCtrl.removeVideoFromPlaylist);

module.exports = router;
