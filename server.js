// PURPOSE: Express backend for path history storage
// LAYER: Backend API — in-memory session store
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory history store
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

app.listen(PORT, () => {
  console.log(`RouteMaster API running on http://localhost:${PORT}`);
});
