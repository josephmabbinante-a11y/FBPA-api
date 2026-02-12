import express from 'express';
import { Exception } from './models.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const exceptions = await Exception.find().sort({ createdAt: -1 });
    res.json({ exceptions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = req.body || {};
    const entry = new Exception({
      id: payload.id || `exc-${Date.now()}`,
      invoiceId: payload.invoiceId,
      invoiceNumber: payload.invoiceNumber,
      customerId: payload.customerId,
      customer: payload.customer,
      carrierId: payload.carrierId,
      carrier: payload.carrier,
      amount: payload.amount || 0,
      type: payload.type || 'financial',
      reason: payload.reason || payload.description,
      description: payload.description || payload.reason,
      severity: payload.severity || 'Medium',
      status: payload.status || 'Open',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
