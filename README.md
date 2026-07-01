# 🎵 Madhan Music

A personal cloud music streaming platform with Spotify-quality UI. Stream your music library from Google Drive with a premium experience on desktop, tablet, and mobile.

![Madhan Music](https://img.shields.io/badge/Madhan_Music-Personal_Streaming-00E5FF?style=for-the-badge)

## ✨ Features

- **🎧 Premium Music Player** — Play, pause, seek, shuffle, repeat, volume, playback speed
- **📱 Fully Responsive** — Desktop (3-panel), tablet (collapsible sidebar), mobile (Spotify-style bottom nav)
- **📲 PWA Support** — Install on any device, works offline
- **🔍 Instant Search** — Search songs, artists, albums in real-time
- **📝 Playlist System** — Create, edit, reorder playlists
- **❤️ Favorites** — Like/unlike songs
- **📊 Analytics Dashboard** — Listening hours, most played, genre distribution charts
- **🤖 Recommendations** — Personalized based on listening history
- **🛡️ Admin Panel** — Single add, bulk import, CSV import for easy library management
- **☁️ Google Drive Storage** — Stream audio directly from your Drive
- **🔐 JWT Authentication** — Secure login/register with session persistence
- **🌙 Dark Theme** — Premium glassmorphic design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Charts | Recharts |
| Auth | JWT + bcrypt |
| PWA | vite-plugin-pwa |
| Deployment | GitHub Pages + Render |

## 🚀 Quick Start

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📖 Full Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## 📁 Project Structure

```
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Layout, Player, Common components
│   │   ├── pages/       # All page components
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # API layer (Axios)
│   │   ├── hooks/       # Custom React hooks
│   │   └── utils/       # Utilities and constants
│   └── public/          # Static assets, PWA icons
│
├── backend/           # Express.js backend
│   └── src/
│       ├── models/      # MongoDB schemas
│       ├── controllers/ # Route handlers
│       ├── routes/      # API routes
│       ├── middleware/   # Auth, rate limiting
│       └── utils/       # Google Drive utilities
│
├── DEPLOYMENT.md      # Deployment instructions
└── README.md          # This file
```

## 🎨 Design

- **Dark theme** with `#080808` background
- **Glassmorphism** with backdrop blur effects
- **Accent color**: `#00E5FF` (electric cyan)
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React

---

Made with 💙 by Madhan
