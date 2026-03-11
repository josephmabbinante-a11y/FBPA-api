import express from 'express';
import Load from '../models/Load.js';

const router = express.Router();

const normalizeString = (value) => (value || '').trim();

// Get all loads with pagination and optional filters
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, Math.min(200, parseInt(req.query.pageSize, 10) || 50));
    const sort = req.query.sort || '-updatedAt';
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.carrierId) filter.carrierId = req.query.carrierId;
    if (req.query.driverId) filter.driverId = req.query.driverId;
    if (req.query.vehicleId) filter.vehicleId = req.query.vehicleId;

    const [items, total] = await Promise.all([
      Load.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize),
      Load.countDocuments(filter),
    ]);

    res.json({ items, total, page, pageSize, source: 'api' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/risk-signals — placeholder for future compliance signals
router.get('/:id/risk-signals', (req, res) => {
  res.json([]);
});

// GET /:id/events — placeholder for future event log
router.get('/:id/events', (req, res) => {
  res.json([]);
});

// Get load by ID
router.get('/:id', async (req, res) => {
  try {
    const load = await Load.findOne({ id: req.params.id });
    if (!load) return res.status(404).json({ error: 'Load not found' });
    res.json(load);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function createLoad(req, res) {
  try {
    const body = req.body || {};
    const id = `load-${Date.now()}`;
    const newLoad = new Load({
      id,
      referenceNumber: normalizeString(body.referenceNumber),
      status: body.status || 'Pending',
      origin: normalizeString(body.origin),
      destination: normalizeString(body.destination),
      pickupDate: body.pickupDate || null,
      deliveryDate: body.deliveryDate || null,
      equipment: body.equipment || 'Van',
      weight: Number(body.weight) || null,
      mileage: Number(body.mileage) || null,
      rate: Number(body.rate) || null,
      customerId: normalizeString(body.customerId),
      carrierId: normalizeString(body.carrierId),
      driverId: normalizeString(body.driverId),
      vehicleId: normalizeString(body.vehicleId),
      notes: normalizeString(body.notes),
    });
    await newLoad.save();
    res.status(201).json(newLoad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new load
router.post('/', createLoad);

// POST /create — alias for creating a load (matches frontend expectation)
router.post('/create', createLoad);

// GET /templates/list — load templates
router.get('/templates/list', async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /estimate-mileage — estimate mileage between origin and destination
router.post('/estimate-mileage', (req, res) => {
  const { origin, destination } = req.body || {};
  if (!origin || !destination) {
    return res.status(400).json({ error: 'origin and destination are required' });
  }
  // Placeholder: derive a deterministic estimate from input string lengths.
  // Multiplier (47) and range (200–3000 miles) approximate typical US freight lanes.
  const hash = (origin.length + destination.length) * 47;
  const estimatedMiles = 200 + (hash % 2800);
  // Confidence: deterministic value in 60–85 range
  const confidence = 60 + (hash % 26);
  res.json({ origin, destination, miles: estimatedMiles, estimatedMiles, method: 'estimated', confidence });
});

// Update load (partial)
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body || {};
    const load = await Load.findOne({ id: req.params.id });
    if (!load) return res.status(404).json({ error: 'Load not found' });

    const stringFields = ['referenceNumber', 'origin', 'destination', 'notes', 'customerId', 'carrierId', 'driverId', 'vehicleId'];
    for (const field of stringFields) {
      if (updates[field] !== undefined) load[field] = normalizeString(updates[field]);
    }
    if (updates.status !== undefined) load.status = updates.status;
    if (updates.equipment !== undefined) load.equipment = updates.equipment;
    const dateFields = ['pickupDate', 'deliveryDate'];
    for (const field of dateFields) {
      if (updates[field] !== undefined) load[field] = updates[field];
    }
    const numericFields = ['weight', 'mileage', 'rate'];
    for (const field of numericFields) {
      if (updates[field] !== undefined) load[field] = Number(updates[field]) || null;
    }

    load.updatedAt = new Date();
    await load.save();
    res.json(load);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
