import express from "express";
import Invoice from "../models/Invoice.js";
import { invoiceValidators, validate } from "../middleware/validators.js";

const router = express.Router();

// GET all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json({ invoices, count: invoices.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET invoice by ID
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Create new invoice
router.post("/", invoiceValidators, validate, async (req, res) => {
  try {
    const { invoiceNumber, amount, status, date } = req.body;

    const newInvoice = new Invoice({
      invoiceNumber,
      amount,
      status: status || "pending",
      date: date || new Date()
    });

    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Update invoice
router.put("/:id", invoiceValidators, validate, async (req, res) => {
  try {
    const { invoiceNumber, amount, status, date } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { invoiceNumber, amount, status, date },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove invoice
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ message: "Invoice deleted", deletedInvoice: invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
