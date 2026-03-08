import express from "express";

const router = express.Router();

// GET reports summary
router.get("/", async (req, res) => {
  try {
    const reportsData = {
      monthlySummary: [
        {
          month: "January",
          invoices: 1050,
          exceptions: 78,
          savings: 10250.5,
        },
        {
          month: "February",
          invoices: 1247,
          exceptions: 89,
          savings: 12450.75,
        },
      ],
      exceptionBreakdown: [
        { reason: "Rate Mismatch", count: 34, percentage: 38.2 },
        { reason: "Duplicate Invoice", count: 28, percentage: 31.5 },
        { reason: "Invalid Accessorials", count: 15, percentage: 16.9 },
        { reason: "Other", count: 12, percentage: 13.4 },
      ],
      statusDistribution: [
        { status: "Audited", count: 645, percentage: 51.6 },
        { status: "Pending", count: 412, percentage: 33.0 },
        { status: "Exception", count: 190, percentage: 15.2 },
      ],
      topSavingsCarriers: [
        { carrier: "FastShip", total: 2450.75 },
        { carrier: "Oceanic", total: 1980.5 },
        { carrier: "RailMax", total: 1750.25 },
        { carrier: "AirLogistics", total: 1520.1 },
      ],
    };

    res.json(reportsData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
