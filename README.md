# NSRL Vision - Music Visualizer

A modern music visualization PWA that analyzes and plays songs with AI-powered vibe detection.

## Features

- 🎵 **Music Search**: Search any song by name and artist
- 🎨 **Vibe Analysis**: AI extracts dominant colors from album art
- 📀 **Vinyl Player**: Beautiful rotating vinyl with album cover
- 📱 **PWA Ready**: Install as a mobile app

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python FastAPI + yt-dlp
- **Audio**: Proxied streaming for cross-origin support

## Quick Start

### Backend
```bash
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   └── App.jsx      # Main React component
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /visualize` - Search and analyze a song
- `GET /proxy-stream?url=` - Proxy audio stream

## License

MIT
