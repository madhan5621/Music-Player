# Madhan Music — Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Google Drive account with audio files
- GitHub account
- Render account

---

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with password
4. Add `0.0.0.0/0` to IP whitelist (for Render access)
5. Get your connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/madhan-music?retryWrites=true&w=majority
   ```

---

## 2. Google Drive Setup

1. Upload your audio files to Google Drive
2. For each file/folder, right-click → **Share** → **Anyone with the link** → **Viewer**
3. Copy the sharing link for each file
4. The admin page will automatically extract the File ID from the link

---

## 3. Backend Deployment (Render)

### Local Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### Deploy to Render

1. Push your code to a GitHub repository
2. Go to [Render](https://render.com)
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Name**: `madhan-music-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add environment variables:
   - `MONGODB_URI` → your Atlas connection string
   - `JWT_SECRET` → a strong random string (use: `openssl rand -hex 32`)
   - `FRONTEND_URL` → your GitHub Pages URL
   - `NODE_ENV` → `production`
7. Click **Create Web Service**

Your API will be at: `https://music-player-s56t.onrender.com`

---

## 4. Frontend Deployment (GitHub Pages)

### Local Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### Configure for Production

1. Update `frontend/.env`:
   ```
   VITE_API_URL=https://music-player-s56t.onrender.com
   ```

   If `.env` is missing during `npm run deploy`, the frontend uses `https://music-player-s56t.onrender.com` for production builds and `http://localhost:5000` only during local development.

2. Update `frontend/package.json` homepage:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/"
   ```

### Deploy to GitHub Pages

```bash
cd frontend
npm run deploy
```

This will:
1. Build the production bundle
2. Push to the `gh-pages` branch

### Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **(root)**
4. Save

Your app will be at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

## 5. First Use

1. Open your deployed frontend URL
2. Register a new account
3. Go to **Admin** page
4. Add songs using Google Drive links
5. Start listening! 🎵

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 64-char hex |
| `PORT` | Server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://user.github.io/repo` |
| `NODE_ENV` | Environment | `production` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.onrender.com` |
