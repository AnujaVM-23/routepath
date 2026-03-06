# 🏭 RouteMaster — Warehouse BFS Pathfinder

> Professional warehouse shortest-path navigator using Breadth-First Search with an interactive dashboard, visual grid builder, and animated path visualization.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running Locally](#-running-locally)
- [Building for Production](#-building-for-production)
- [Deployment](#-deployment)
- [API Reference](#-api-reference)
- [Algorithm](#-algorithm)
- [Sample Input/Output](#-sample-inputoutput)
- [Grid Cell Values](#-grid-cell-values)

---

## ✨ Features

- **Dashboard** — Landing page with live stats, success rate ring chart, recent activity table, and quick actions
- **3 Input Modes** — JSON editor, file upload (drag & drop), and visual grid builder
- **JSON Validation** — Real-time validation with detailed error messages (only 0, 1, 2 allowed in grid)
- **BFS Pathfinding** — Guaranteed shortest path with animated exploration + path reveal
- **Grid Visualization** — Interactive warehouse grid with tooltips, annotations, and legend
- **Result Page** — Formatted JSON output with copy, download, and path breakdown
- **Path History** — Session-based history stored via Express backend API
- **Dark Theme** — Navy-indigo professional UI with glow animations

---

## 🛠️ Tech Stack

| Layer       | Technology           | Version |
|-------------|---------------------|---------|
| Frontend    | React               | 18.2    |
| Build Tool  | Vite                | 5.1     |
| Styling     | Tailwind CSS        | 3.4     |
| Backend     | Express.js          | 4.18    |
| Language    | JavaScript (ES Modules) | —   |
| Font        | Inter + JetBrains Mono | —    |

---

## 📁 Project Structure

```
routemaster/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite build config
├── tailwind.config.js          # Tailwind theme config
├── postcss.config.js           # PostCSS plugins
├── server.js                   # Express API (port 3001)
├── requirements.txt            # Dependency reference
├── README.md                   # This file
└── src/
    ├── main.jsx                # React entry point
    ├── index.css               # Global styles & animations
    ├── App.jsx                 # State orchestration & routing
    ├── algorithms/
    │   └── bfs.js              # Core BFS algorithm (pure logic)
    ├── utils/
    │   └── pathHelpers.js      # Validation, formatting, explanation
    └── components/
        ├── Dashboard.jsx       # Landing page with stats & actions
        ├── InputPanel.jsx      # JSON input / upload / grid builder
        ├── GridBuilder.jsx     # Visual click-to-build grid
        ├── GridVisualizer.jsx  # Animated warehouse grid display
        ├── OutputPanel.jsx     # JSON output display
        ├── ResultPage.jsx      # Full result page with copy/download
        └── HistoryPanel.jsx    # Path history list
```

---

## ⚙️ Prerequisites

- **Node.js** >= 18.x — [Download](https://nodejs.org/)
- **npm** >= 9.x (comes with Node.js)

Verify installation:
```bash
node --version
npm --version
```

---

## 📦 Installation

```bash
# Clone or download the project
cd routemaster

# Install all dependencies
npm install
```

---

## 🚀 Running Locally

You need **two terminals** — one for the frontend dev server and one for the backend API:

### Terminal 1 — Backend API (Express)
```bash
npm run server
```
Starts Express server at `http://localhost:3001`

### Terminal 2 — Frontend Dev Server (Vite)
```bash
npm run dev
```
Starts Vite dev server at `http://localhost:5173`

Open your browser to **http://localhost:5173**

---

## 🏗️ Building for Production

```bash
# Build optimized static files
npm run build
```

Output is written to the `dist/` folder. To preview the production build:

```bash
npm run preview
```

---

## 🌐 Deployment

### Option A: Static Hosting (Vercel / Netlify / GitHub Pages)

The frontend is a static SPA. Deploy the `dist/` folder:

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Drag and drop the dist/ folder on netlify.com
# Or use Netlify CLI:
npx netlify deploy --prod --dir=dist
```

> **Note:** For static deployments, the history API won't work unless you also deploy the Express backend separately.

### Option B: Full-Stack Deployment (Render / Railway / VPS)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Update `server.js` to serve the static files (add before the listen call):
   ```js
   import path from 'path';
   import { fileURLToPath } from 'url';
   const __dirname = path.dirname(fileURLToPath(import.meta.url));
   app.use(express.static(path.join(__dirname, 'dist')));
   app.get('*', (_req, res) => {
     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
   });
   ```

3. Set the start command to:
   ```bash
   node server.js
   ```

4. Set the `PORT` environment variable if required by the platform:
   ```js
   const PORT = process.env.PORT || 3001;
   ```

### Option C: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
```

```bash
docker build -t routemaster .
docker run -p 3001:3001 routemaster
```

---

## 📡 API Reference

Base URL: `http://localhost:3001/api`

| Method | Endpoint       | Description              |
|--------|---------------|--------------------------|
| GET    | /api/history  | Fetch all history entries |
| POST   | /api/history  | Save a new path result   |
| DELETE | /api/history  | Clear all history        |

### POST /api/history — Request Body
```json
{
  "gridDimensions": "3×3",
  "start": [0, 0],
  "target": [2, 1],
  "totalSteps": 3,
  "targetReached": true,
  "executionTimeMs": 1
}
```

---

## 🧠 Algorithm

**Breadth-First Search (BFS)** — explores all neighbors at each depth level before going deeper, guaranteeing the shortest path in an unweighted grid.

| Property    | Value  |
|-------------|--------|
| Time        | O(V+E) |
| Space       | O(V)   |
| Optimal     | ✅ Yes  |
| Complete    | ✅ Yes  |

---

## 📊 Sample Input/Output

### Input
```json
{
  "grid": [
    [0, 0, 1],
    [1, 0, 1],
    [0, 2, 0]
  ],
  "start": [0, 0],
  "targets": [[2, 1]]
}
```

### Output
```json
{
  "total_steps": 3,
  "path": [[0,0],[0,1],[1,1],[2,1]],
  "target_reached": true,
  "execution_time_ms": 1
}
```

---

## 🧱 Grid Cell Values

| Value | Meaning       | Grid Builder |
|-------|---------------|-------------|
| `0`   | Walkable cell | Default     |
| `1`   | Obstacle      | 🧱          |
| `2`   | Item / Target | 📦          |

Any value other than 0, 1, or 2 will be rejected with an "Invalid input" error.

---

## 📄 License

MIT

## Grid Values
- `0` — Walkable cell
- `1` — Obstacle (impassable)
- `2` — Target cell

## Tech Stack
- React 18
- Vite
- Tailwind CSS
