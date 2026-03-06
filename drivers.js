import express from 'express';
import Driver from './Driver.js';
const router = express.Router();

// GET all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ updatedAt: -1 });
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
