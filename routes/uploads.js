import express from "express";

const router = express.Router();

// GET upload history
router.get("/", async (req, res) => {
  try {
    const uploadHistory = [
      {
        id: 1,
        fileName: "feb-9-invoices.csv",
        uploadDate: new Date().toISOString(),
        invoiceCount: 42,
        status: "Processed",
        successCount: 42,
        errorCount: 0,
      },
      {
        id: 2,
        fileName: "feb-8-batch.xlsx",
        uploadDate: new Date(Date.now() - 86400000).toISOString(),
        invoiceCount: 28,
        status: "Processed",
        successCount: 28,
        errorCount: 0,
      },
      {
        id: 3,
        fileName: "feb-7-partial.csv",
        uploadDate: new Date(Date.now() - 172800000).toISOString(),
        invoiceCount: 35,
        status: "Completed with Warnings",
        successCount: 33,
        errorCount: 2,
      },
      {
        id: 4,
        fileName: "feb-6-invoices.xlsx",
        uploadDate: new Date(Date.now() - 259200000).toISOString(),
        invoiceCount: 51,
        status: "Processed",
        successCount: 51,
        errorCount: 0,
      },
      {
        id: 5,
        fileName: "feb-5-batch.csv",
        uploadDate: new Date(Date.now() - 345600000).toISOString(),
        invoiceCount: 38,
        status: "Processed",
        successCount: 38,
        errorCount: 0,
      },
    ];

    res.json({ uploads: uploadHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Upload invoice file
router.post("/", async (req, res) => {
  try {
    // Simple mock implementation - in production would handle multipart/form-data
    // For now, accept JSON body with file data
    const { fileName, invoiceCount } = req.body;

    if (!fileName || !invoiceCount) {
      return res.status(400).json({
        error: "Missing fileName or invoiceCount",
      });
    }

    const uploadResult = {
      id: Date.now(),
      fileName,
      uploadDate: new Date().toISOString(),
      invoiceCount,
      status: "Processed",
      successCount: invoiceCount,
      errorCount: 0,
      message: "File uploaded and processed successfully",
    };

    res.status(201).json(uploadResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
