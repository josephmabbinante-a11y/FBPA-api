import express from 'express';
import Vehicle from './Vehicle.js';
const router = express.Router();

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ updatedAt: -1 });
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
