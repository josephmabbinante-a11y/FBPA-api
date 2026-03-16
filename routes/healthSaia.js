import express from 'express';

const router = express.Router();

// GET /api/health/saia - Health check for SAIA integration
router.get('/', (req, res) => {
  // You can add real health check logic here if needed
  res.json({ status: 'ok', service: 'saia', timestamp: new Date().toISOString() });
});

export default router;
