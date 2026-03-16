import express from 'express';

const router = express.Router();

// GET /api/tracker/loads - List all tracked loads (placeholder)
router.get('/loads', (req, res) => {
  // Replace with real data source if needed
  res.json({ items: [], total: 0, message: 'No tracked loads (placeholder)' });
});

// GET /api/tracker/loads/:id - Get a tracked load by ID (placeholder)
router.get('/loads/:id', (req, res) => {
  // Replace with real data source if needed
  res.status(404).json({ error: 'Tracked load not found (placeholder)' });
});

export default router;
