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
router.get('/analytics/overview', requireAuth, analyticsCtrl.getOverview);

router.get('/analytics/daily', requireAuth, analyticsCtrl.getDailyStats);

router.get('/analytics/top-videos', requireAuth, analyticsCtrl.getTopVideos);

// ─── Video Routes ────────────────────────────────────────────────

// List Videos
router.get('/videos/list', requireAuth, videoCtrl.listVideos);

// IMPORTANT: Static routes FIRST
router.get('/videos/trending', videoCtrl.getTrendingVideos);

router.get('/videos/search', videoCtrl.searchYoutubeVideos);

// Dynamic routes AFTER static routes
router.get('/videos/:videoId', requireAuth, videoCtrl.getVideoDetails);

router.patch('/videos/:videoId', requireAuth, videoCtrl.updateVideoMetadata);

router.post(
  '/videos/:videoId/thumbnail',
  requireAuth,
  upload.single('thumbnail'),
  videoCtrl.updateThumbnail
);

// ─── Playlist Routes ─────────────────────────────────────────────
router.get('/playlists', requireAuth, playlistCtrl.listPlaylists);

router.post('/playlists', requireAuth, playlistCtrl.createPlaylist);

router.get(
  '/playlists/:playlistId/videos',
  requireAuth,
  playlistCtrl.getPlaylistVideos
);

router.post(
  '/playlists/:playlistId/videos',
  requireAuth,
  playlistCtrl.addVideoToPlaylist
);

router.delete(
  '/playlists/:playlistId/videos/:playlistItemId',
  requireAuth,
  playlistCtrl.removeVideoFromPlaylist
);

module.exports = router;