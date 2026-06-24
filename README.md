# CSV -> Map

Web application for uploading CSV files with geographic coordinates, visualizing them on an interactive map, and styling points by numeric properties.

## Features

- Drag-and-drop CSV upload
- GeoJSON conversion on the backend (`lat` / `lng` columns required)
- Full-screen OpenStreetMap map with vector layer
- Layer panel: name, visibility, opacity, CSV replace
- Analytics panel: numeric property, intervals, color scale
- Feature popup on click with all object properties

## Stack

| Part | Technologies |
|------|--------------|
| Frontend | Vue 3, TypeScript, Vite, Vuetify, OpenLayers 10.x, SASS |
| Backend | Node.js, Fastify, csv-parser |

## Project structure

```
├── backend/          # Fastify API
├── frontend/         # Vue SPA
├── sample-data/      # Example CSV for testing
└── README.md
```

## Prerequisites

- Node.js 18+
- npm

## Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Development

Run backend and frontend in separate terminals.

### Backend (port 3000)

```bash
cd backend
npm run dev
```

Health check: [http://localhost:3000/health](http://localhost:3000/health)

### Frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies `/upload` and `/health` to the backend.

## Production build

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

Build output is written to `frontend/dist/`.

### Backend

```bash
cd backend
npm start
```

Serve `frontend/dist` with any static file server and ensure API requests reach the backend on port 3000 (configure reverse proxy as needed).

## CSV format

Required columns:

- `lat` — latitude (decimal degrees)
- `lng` — longitude (decimal degrees)

Additional columns are preserved as feature properties and can be used for styling and popups.

Example (`sample-data/cities.csv`):

```csv
name,lat,lng,temperature,population
Moscow,55.7558,37.6173,22,12500000
Paris,48.8566,2.3522,24,2200000
```

## API

### `POST /upload`

- Content-Type: `multipart/form-data`
- Field name: `file`
- Response: GeoJSON `FeatureCollection`

Limits:

- Max file size: 10 MB
- Max rows: 100 000

## Quick test

1. Start backend and frontend.
2. Drag `sample-data/cities.csv` onto the map.
3. Use the analytics panel to color by `temperature` or `population`.
4. Click a point to see its properties.

## Troubleshooting

**Port 3000 already in use**

```powershell
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force
```

**Points appear in wrong locations**

Ensure CSV uses `lat` and `lng` columns with correct values. GeoJSON coordinates must be `[longitude, latitude]`.