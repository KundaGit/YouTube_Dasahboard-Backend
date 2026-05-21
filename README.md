# 🎬 YouTube Manager — Kundan AI Studio

Full YouTube channel manager using YouTube Data API v3 + Analytics API.

---

## ⚙️ Setup

### Step 1: Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (e.g. `kundan-yt-manager`)
3. Enable these APIs:
   - **YouTube Data API v3**
   - **YouTube Analytics API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/auth/callback`
7. Copy **Client ID** and **Client Secret**

### Step 2: Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=any_random_string
CHANNEL_ID=UCvAO4469rxoziJbZKpAZg5g
```

### Step 3: Install & Run

```bash
npm install
npm run dev
```

---

## 🔐 Authentication

1. Visit: `http://localhost:3000/auth/login`
2. Login with your YouTube Google account
3. Grant all permissions
4. You'll see `✅ YouTube authenticated successfully!`

---

## 📡 API Endpoints

### Analytics
```
GET /api/analytics/overview?startDate=2026-01-01&endDate=2026-05-18
GET /api/analytics/daily?startDate=2026-05-01&endDate=2026-05-18
GET /api/analytics/top-videos?startDate=2026-01-01&limit=10
```

### Videos
```
GET  /api/videos/list?maxResults=20&order=date
GET  /api/videos/VIDEO_ID
PATCH /api/videos/VIDEO_ID         { "title": "...", "description": "...", "tags": [...] }
POST /api/videos/VIDEO_ID/thumbnail  (form-data: thumbnail = image file)
```

### Playlists
```
GET    /api/playlists
POST   /api/playlists                         { "title": "...", "description": "...", "privacyStatus": "public" }
GET    /api/playlists/PLAYLIST_ID/videos
POST   /api/playlists/PLAYLIST_ID/videos      { "videoId": "..." }
DELETE /api/playlists/PLAYLIST_ID/videos/ITEM_ID
```

---

## 🚀 Future Ideas

- [ ] Angular frontend dashboard
- [ ] Bulk thumbnail updater
- [ ] Auto-add new videos to playlists
- [ ] Weekly analytics email report
- [ ] Deploy on Render/Railway
