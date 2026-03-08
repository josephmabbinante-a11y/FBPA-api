import express from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import LoadboardSheet from './LoadboardSheet.js';

const router = express.Router();
const upload = multer();

// Upload a loadboard sheet (CSV)
router.post('/sheets/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const csv = req.file.buffer.toString('utf-8');
    const rows = parse(csv, { columns: true, skip_empty_lines: true });
    const sheet = new LoadboardSheet({
      id: `lbs-${Date.now()}`,
      name: req.body?.name || req.file.originalname,
      uploadedBy: req.body?.uploadedBy || '',
      fileName: req.file.originalname,
      rows,
    });
    await sheet.save();
    res.status(201).json({ message: 'Sheet uploaded', sheet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all loadboard sheets
router.get('/sheets', async (req, res) => {
  try {
    const sheets = await LoadboardSheet.find().sort({ createdAt: -1 });
    res.json({ sheets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific sheet by ID
router.get('/sheets/:id', async (req, res) => {
  try {
    const sheet = await LoadboardSheet.findOne({ id: req.params.id });
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
    res.json({ sheet });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
