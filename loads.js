router.get('/templates/list', async (req, res) => {
  // Example static templates; replace with DB query if needed
  const templates = [
    { id: 'tpl-1', name: 'Caterpillar Loads', customer: 'Not set', picks: 0, drops: 0, branch: 'Shared' },
    { id: 'tpl-2', name: 'Gregory Packaging Colorado Load', customer: 'Gregory Packaging Inc.', picks: 1, drops: 1, branch: 'Shared' },
    { id: 'tpl-3', name: 'Gregory Packaging Load', customer: 'Not set', picks: 0, drops: 0, branch: 'Shared' },
    { id: 'tpl-4', name: 'N and H Construction Load', customer: 'Not set', picks: 2, drops: 2, branch: 'Shared' },
    { id: 'tpl-5', name: 'Panda Kitchen Load', customer: 'Panda Kitchen and Bath', picks: 1, drops: 1, branch: 'Shared' },
  ];
  res.json({ templates });
});
import express from 'express';
import Load from './Load.js';
const router = express.Router();
import express from 'express';
import Load from './Load.js';
const router = express.Router();
// GET /templates/list endpoint for load templates
router.get('/templates/list', async (req, res) => {
  // Example static templates; replace with DB query if needed
  const templates = [
    { id: 'tpl-1', name: 'Caterpillar Loads', customer: 'Not set', picks: 0, drops: 0, branch: 'Shared' },
    { id: 'tpl-2', name: 'Gregory Packaging Colorado Load', customer: 'Gregory Packaging Inc.', picks: 1, drops: 1, branch: 'Shared' },
    { id: 'tpl-3', name: 'Gregory Packaging Load', customer: 'Not set', picks: 0, drops: 0, branch: 'Shared' },
    { id: 'tpl-4', name: 'N and H Construction Load', customer: 'Not set', picks: 2, drops: 2, branch: 'Shared' },
    { id: 'tpl-5', name: 'Panda Kitchen Load', customer: 'Panda Kitchen and Bath', picks: 1, drops: 1, branch: 'Shared' },
  ];
  res.json({ templates });
});
// POST /estimate-mileage endpoint
router.post('/estimate-mileage', async (req, res) => {
  const { origin, destination } = req.body;
  // Dummy mileage calculation, replace with real logic as needed
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination required.' });
  }
  // Example: always return 100 miles
  res.json({ origin, destination, estimatedMileage: 100 });
});
// ...existing code...

// GET all loads
// GET all loads with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    // Filtering
    const tab = req.query.tab || 'all';
    let filter = {};
    if (tab !== 'all') {
      filter.status = tab;
    }

    // Sorting
    let sort = {};
    if (req.query.sort) {
      // e.g., sort=-updatedAt or sort=updatedAt
      const sortField = req.query.sort.replace('-', '');
      sort[sortField] = req.query.sort.startsWith('-') ? -1 : 1;
    } else {
      sort = { updatedAt: -1 };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 25;
    const skip = (page - 1) * pageSize;

    const total = await Load.countDocuments(filter);
    const loads = await Load.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    res.json({
      loads,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
