// PURPOSE: Express backend for path history storage
// LAYER: Backend API — in-memory session store
// Serves the built React frontend (dist/) in production
// API endpoints: POST/GET/DELETE /api/history
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Render injects PORT env variable in production

app.use(cors());                // Allow cross-origin requests (dev mode)
app.use(express.json());        // Parse JSON request bodies

// In-memory history store (resets on server restart)
let history = [];
let nextId = 1;

// POST /api/history — save a new result
app.post('/api/history', (req, res) => {
  const { gridDimensions, start, target, totalSteps, targetReached, executionTimeMs } = req.body;

  if (!gridDimensions || !start || !target) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const entry = {
    id: nextId++,
    gridDimensions,
    start,
    target,
    totalSteps: totalSteps ?? 0,
    targetReached: targetReached ?? false,
    executionTimeMs: executionTimeMs ?? 0,
    timestamp: new Date().toISOString(),
  };

  history.unshift(entry);
  res.status(201).json(entry);
});

// GET /api/history — fetch all past results
app.get('/api/history', (_req, res) => {
  res.json(history);
});

// DELETE /api/history — clear all history
app.delete('/api/history', (_req, res) => {
  history = [];
  nextId = 1;
  res.json({ message: 'History cleared.' });
});

// Serve built React frontend (Vite output) in production
// This must come after API routes so /api/* is handled first
app.use(express.static(path.join(__dirname, 'dist')));
// Fallback: serve index.html for all non-API routes (SPA client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RouteMaster running on port ${PORT}`);
});
