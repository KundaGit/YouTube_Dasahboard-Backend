const { google } = require('googleapis');
const { oauth2Client } = require('../config/oauth');
const fs = require('fs');

const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
const CHANNEL_ID = process.env.CHANNEL_ID;

// GET /videos/list
// const listVideos = async (req, res) => {
//   try {
//     const { maxResults = 20, order = 'date', pageToken } = req.query;

//     const response = await youtube.search.list({
//       part: ['snippet'],
//       channelId: CHANNEL_ID,
//       maxResults: parseInt(maxResults),
//       order,
//       type: ['video'],
//       ...(pageToken && { pageToken }),
//     });

//     const videos = response.data.items?.map(item => ({
//       videoId: item.id.videoId,
//       title: item.snippet.title,
//       description: item.snippet.description,
//       thumbnail: item.snippet.thumbnails?.high?.url,
//       publishedAt: item.snippet.publishedAt,
//       videoUrl: `https://youtube.com/watch?v=${item.id.videoId}`,
//     }));

//     res.json({
//       success: true,
//       count: videos?.length || 0,
//       nextPageToken: response.data.nextPageToken || null,
//       data: videos,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

const listVideos = async (req, res) => {
  try {
    const { maxResults = 50, pageToken } = req.query;

    // Step 1: Channel uploads playlist fetch karo
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      id: [CHANNEL_ID],
    });

    const uploadsPlaylistId =
      channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    // Step 2: Uploads playlist se videos lao
    const response = await youtube.playlistItems.list({
      part: ['snippet'],
      playlistId: uploadsPlaylistId,
      maxResults: parseInt(maxResults),
      ...(pageToken && { pageToken }),
    });
    const ids = response.data.items
  .map(item => item.snippet.resourceId.videoId)
  .join(',');

const videoDetails = await youtube.videos.list({
  part: ['contentDetails'],
  id: ids,
});

   const videos = response.data.items
  ?.filter(item => item.snippet?.resourceId?.videoId)
  .map((item ,index)=> ({

    videoId:
      item.snippet.resourceId.videoId,

    title:
      item.snippet.title,

    description:
      item.snippet.description,

    thumbnail:
      item.snippet.thumbnails?.high?.url,

    publishedAt:
      item.snippet.publishedAt,

    duration:
  videoDetails.data.items[index]
    ?.contentDetails
    ?.duration || 'PT0S',

    videoUrl:
      `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,

  }));

    res.json({
      success: true,
      count: videos?.length || 0,
      nextPageToken: response.data.nextPageToken || null,
      data: videos,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET /videos/:videoId
const getVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [videoId],
    });

    const video = response.data.items?.[0];
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    res.json({
      success: true,
      data: {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails?.high?.url,
        tags: video.snippet.tags || [],
        duration: video.contentDetails.duration,
        statistics: {
          views: parseInt(video.statistics.viewCount || 0),
          likes: parseInt(video.statistics.likeCount || 0),
          comments: parseInt(video.statistics.commentCount || 0),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /videos/:videoId
// Update title, description, tags
const updateVideoMetadata = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, tags } = req.body;

    // First fetch existing snippet to avoid overwriting
    const existing = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId],
    });

    const snippet = existing.data.items?.[0]?.snippet;
    if (!snippet) return res.status(404).json({ success: false, message: 'Video not found' });

    const response = await youtube.videos.update({
      part: ['snippet'],
      requestBody: {
        id: videoId,
        snippet: {
          title: title || snippet.title,
          description: description || snippet.description,
          tags: tags || snippet.tags,
          categoryId: snippet.categoryId,
        },
      },
    });

    res.json({
      success: true,
      message: '✅ Video metadata updated successfully',
      data: {
        videoId: response.data.id,
        title: response.data.snippet.title,
        description: response.data.snippet.description,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /videos/:videoId/thumbnail
// Upload new thumbnail (image file)
const updateThumbnail = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded. Use field name: thumbnail' });
    }

    const response = await youtube.thumbnails.set({
      videoId,
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(req.file.path),
      },
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: '✅ Thumbnail updated successfully!',
      data: {
        videoId,
        thumbnailUrl: response.data.items?.[0]?.high?.url,
      },
    });
  } catch (err) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// For All video related operations on Youtube
const getTrendingVideos = async (req, res) => {
  try {

    const response = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      chart: 'mostPopular',
      regionCode: 'IN',
      maxResults: 20
    });

    res.json({
      success: true,
      data: response.data.items
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};
const searchYoutubeVideos = async (req, res) => {
  try {

    const { q, maxResults = 20 } = req.query;

    const response = await youtube.search.list({
      part: ['snippet'],
      q,
      type: ['video'],
      maxResults: parseInt(maxResults)
    });

    res.json({
      success: true,
      data: response.data.items
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

module.exports = { listVideos, getVideoDetails, updateVideoMetadata, updateThumbnail, getTrendingVideos,
  searchYoutubeVideos };
