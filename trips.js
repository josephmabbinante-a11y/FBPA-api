import express from 'express';
import Trip from './Trip.js';
const router = express.Router();

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ updatedAt: -1 });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
