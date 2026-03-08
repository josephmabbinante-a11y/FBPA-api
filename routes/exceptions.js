import express from "express";
import Exception from "../models/Exception.js";
import { exceptionValidators, validate } from "../middleware/validators.js";

const router = express.Router();

// GET all exceptions
router.get("/", async (req, res) => {
  try {
    const exceptions = await Exception.find();
    res.json({ exceptions, count: exceptions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET exception by ID
router.get("/:id", async (req, res) => {
  try {
    const exception = await Exception.findById(req.params.id);
    if (!exception) {
      return res.status(404).json({ error: "Exception not found" });
    }
    res.json(exception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new exception
router.post("/", exceptionValidators, validate, async (req, res) => {
  try {
    const { code, message, severity, details } = req.body;

    const newException = new Exception({
      code,
      message,
      severity,
      details: details || {},
      timestamp: new Date()
    });

    await newException.save();
    res.status(201).json(newException);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update exception
router.put("/:id", exceptionValidators, validate, async (req, res) => {
  try {
    const { code, message, severity, details } = req.body;

    const exception = await Exception.findByIdAndUpdate(
      req.params.id,
      { code, message, severity, details },
      { new: true, runValidators: true }
    );

    if (!exception) {
      return res.status(404).json({ error: "Exception not found" });
    }

    res.json(exception);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove exception
router.delete("/:id", async (req, res) => {
  try {
    const exception = await Exception.findByIdAndDelete(req.params.id);

    if (!exception) {
      return res.status(404).json({ error: "Exception not found" });
    }

    res.json({ message: "Exception deleted", deletedException: exception });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
