import express from 'express';
import Load from './Load.js';
const router = express.Router();

// GET all loads
router.get('/', async (req, res) => {
  try {
    const loads = await Load.find().sort({ updatedAt: -1 });
    res.json({ loads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
