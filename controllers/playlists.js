const { google } = require('googleapis');
const { oauth2Client } = require('../config/oauth');

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
const CHANNEL_ID = process.env.CHANNEL_ID;

// GET /playlists
const listPlaylists = async (req, res) => {
  try {
    const { maxResults = 20 } = req.query;

    const response = await youtube.playlists.list({
      part: ['snippet', 'contentDetails'],
      channelId: CHANNEL_ID,
      maxResults: parseInt(maxResults),
    });

    const playlists = response.data.items?.map(item => ({
      playlistId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url,
      videoCount: item.contentDetails.itemCount,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({
      success: true,
      count: playlists?.length || 0,
      data: playlists,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /playlists/:playlistId/videos
const getPlaylistVideos = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { maxResults = 20 } = req.query;

    const response = await youtube.playlistItems.list({
      part: ['snippet', 'contentDetails'],
      playlistId,
      maxResults: parseInt(maxResults),
    });

    const videos = response.data.items?.map(item => ({
      playlistItemId: item.id,
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      position: item.snippet.position,
      thumbnail: item.snippet.thumbnails?.high?.url,
      addedAt: item.snippet.publishedAt,
      videoUrl: `https://youtube.com/watch?v=${item.contentDetails.videoId}`,
    }));

    res.json({
      success: true,
      playlistId,
      count: videos?.length || 0,
      data: videos,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /playlists/:playlistId/videos
// Add a video to a playlist
const addVideoToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { videoId, position } = req.body;

    if (!videoId) {
      return res.status(400).json({ success: false, message: 'videoId is required in request body' });
    }

    const response = await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId,
          },
          ...(position !== undefined && { position }),
        },
      },
    });

    res.json({
      success: true,
      message: '✅ Video added to playlist successfully!',
      data: {
        playlistItemId: response.data.id,
        playlistId,
        videoId,
        position: response.data.snippet.position,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /playlists/:playlistId/videos/:playlistItemId
// Remove a video from playlist
const removeVideoFromPlaylist = async (req, res) => {
  try {
    const { playlistItemId } = req.params;

    await youtube.playlistItems.delete({ id: playlistItemId });

    res.json({
      success: true,
      message: '✅ Video removed from playlist successfully!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /playlists
// Create a new playlist
const createPlaylist = async (req, res) => {
  try {
    const { title, description = '', privacyStatus = 'public' } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const response = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { title, description },
        status: { privacyStatus },
      },
    });

    res.json({
      success: true,
      message: '✅ Playlist created!',
      data: {
        playlistId: response.data.id,
        title: response.data.snippet.title,
        privacyStatus: response.data.status.privacyStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listPlaylists, getPlaylistVideos, addVideoToPlaylist, removeVideoFromPlaylist, createPlaylist };
