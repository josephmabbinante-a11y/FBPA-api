import express from "express";

const router = express.Router();

// GET dashboard summary
router.get("/", async (req, res) => {
  try {
    const dashboardData = {
      summary: {
        totalInvoices: 1247,
        totalExceptions: 89,
        totalSavings: 12450.75,
        pendingReview: 23,
      },
      trends: {
        invoiceTrend: [
          { day: "Mon", value: 165 },
          { day: "Tue", value: 178 },
          { day: "Wed", value: 192 },
          { day: "Thu", value: 201 },
          { day: "Fri", value: 189 },
          { day: "Sat", value: 156 },
          { day: "Sun", value: 166 },
        ],
        exceptionTrend: [
          { day: "Mon", value: 8 },
          { day: "Tue", value: 12 },
          { day: "Wed", value: 14 },
          { day: "Thu", value: 16 },
          { day: "Fri", value: 15 },
          { day: "Sat", value: 12 },
          { day: "Sun", value: 12 },
        ],
        savingsTrend: [
          { day: "Mon", value: 1420 },
          { day: "Tue", value: 1680 },
          { day: "Wed", value: 2010 },
          { day: "Thu", value: 2310 },
          { day: "Fri", value: 2190 },
          { day: "Sat", value: 1680 },
          { day: "Sun", value: 1560 },
        ],
        pendingTrend: [
          { day: "Mon", value: 31 },
          { day: "Tue", value: 29 },
          { day: "Wed", value: 26 },
          { day: "Thu", value: 24 },
          { day: "Fri", value: 25 },
          { day: "Sat", value: 23 },
          { day: "Sun", value: 23 },
        ],
      },
      exceptionBreakdown: [
        { name: "Rate Mismatch", value: 34, fill: "#8884d8" },
        { name: "Duplicate", value: 28, fill: "#82ca9d" },
        { name: "Accessorial", value: 15, fill: "#ffc658" },
        { name: "Other", value: 12, fill: "#ff8042" },
      ],
      savingsByCarrier: [
        { carrier: "FastShip", savings: 2450.75, invoiceCount: 345 },
        { carrier: "Oceanic", savings: 1980.5, invoiceCount: 312 },
        { carrier: "RailMax", savings: 1750.25, invoiceCount: 289 },
        { carrier: "AirLogistics", savings: 1520.1, invoiceCount: 201 },
        { carrier: "Express Co", savings: 1248.15, invoiceCount: 156 },
      ],
      recentActivity: [
        {
          id: 1,
          type: "exception",
          invoiceNumber: "INV-1001",
          carrier: "FastShip",
          amount: 1245.67,
          status: "Review",
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          type: "upload",
          fileName: "feb-9-invoices.csv",
          count: 42,
          status: "Processed",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          type: "exception",
          invoiceNumber: "INV-1002",
          carrier: "Oceanic",
          amount: 980.5,
          status: "Fail",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
