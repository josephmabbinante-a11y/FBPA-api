import express from 'express';
import Location from './Location.js';
const router = express.Router();

// GET all locations
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ updatedAt: -1 });
    res.json({ locations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
