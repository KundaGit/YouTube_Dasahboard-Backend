const { google } = require('googleapis');
const { oauth2Client } = require('../config/oauth');

const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

const CHANNEL_ID = process.env.CHANNEL_ID;

// GET /analytics/overview
// Views, Watch Time, Subscribers for a date range
const getOverview = async (req, res) => {
  try {
    const { startDate = '2025-01-01', endDate = new Date().toISOString().split('T')[0] } = req.query;

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,likes,shares,comments',
      dimensions: '',
    });

    const row = response.data.rows?.[0] || [];
    const [views, watchMinutes, subsGained, subsLost, likes, shares, comments] = row;

    res.json({
      success: true,
      period: { startDate, endDate },
      data: {
        views: views || 0,
        watchTimeMinutes: watchMinutes || 0,
        watchTimeHours: Math.round((watchMinutes || 0) / 60),
        subscribersGained: subsGained || 0,
        subscribersLost: subsLost || 0,
        netSubscribers: (subsGained || 0) - (subsLost || 0),
        likes: likes || 0,
        shares: shares || 0,
        comments: comments || 0,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /analytics/daily
// Day-by-day breakdown
const getDailyStats = async (req, res) => {
  try {
    const { startDate = '2026-05-01', endDate = new Date().toISOString().split('T')[0] } = req.query;

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,subscribersGained,subscribersLost',
      dimensions: 'day',
      sort: 'day',
    });

    const rows = response.data.rows || [];
    const data = rows.map(([date, views, watchMin, subsGained, subsLost]) => ({
      date,
      views,
      watchTimeMinutes: watchMin,
      subscribersGained: subsGained,
      subscribersLost: subsLost,
      netSubscribers: subsGained - subsLost,
    }));

    res.json({ success: true, period: { startDate, endDate }, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /analytics/top-videos
// Top performing videos by views
const getTopVideos = async (req, res) => {
  try {
    const { startDate = '2026-01-01', endDate = new Date().toISOString().split('T')[0], limit = 10 } = req.query;

    const response = await youtubeAnalytics.reports.query({
      ids: `channel==${CHANNEL_ID}`,
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,likes,shares,averageViewDuration',
      dimensions: 'video',
      sort: '-views',
      maxResults: parseInt(limit),
    });

    const rows = response.data.rows || [];

    // Fetch video titles for the video IDs
    const videoIds = rows.map(row => row[0]).join(',');
    let titles = {};

    if (videoIds) {
const videoDetails = await youtube.videos.list({
  part: ['snippet', 'contentDetails'],
  id: videoIds.split(','),
});
      videoDetails.data.items?.forEach(v => {
        titles[v.id] = v.snippet.title;
      });
    }

    const data = rows.map(([videoId, views, watchMin, likes, shares, avgDuration]) => ({
      videoId,
      title: titles[videoId] || 'Unknown',
      videoUrl: `https://youtube.com/watch?v=${videoId}`,
      views,
      watchTimeMinutes: Math.round(watchMin),
      likes,
      shares,
      avgViewDurationSeconds: Math.round(avgDuration),
    }));

    res.json({ success: true, period: { startDate, endDate }, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOverview, getDailyStats, getTopVideos };
