import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";

dotenv.config();

const app = express();
const allowedOriginsEnv = process.env.CORS_ORIGIN || "";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    // If no allowlist is configured, fall back to allowing all origins
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());


// Root route: show welcome or redirect to register
app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to the FBPA API</h2>
    <p><a href='/register.html'>Register a new user</a></p>
    <p>API is running. Use <code>POST /api/v1/auth/login</code> for login.</p>
  `);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Backwards-compatible alias
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
import invoiceRoutes from "./routes/invoices.js";
import auditRoutes from "./routes/audits.js";
import exceptionRoutes from "./routes/exceptions.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportsRoutes from "./routes/reports.js";
import uploadsRoutes from "./routes/uploads.js";
import authRoutes from "./routes/auth.js";

import path from "path";
import { fileURLToPath } from "url";

app.use("/api/invoices", invoiceRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/exceptions", exceptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/v1/auth", authRoutes);

// Serve registration page
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;

// Connect to MongoDB and start server (optional - will work with mock data if DB unavailable)
connectDB().then((connected) => {
  app.listen(PORT, "0.0.0.0", () => {
    if (connected) {
      console.log(`✓ API running on http://0.0.0.0:${PORT} (Database mode)`);
    } else {
      console.log(`✓ API running on http://0.0.0.0:${PORT} (Mock data mode - no database)`);
    }
  });
}).catch((error) => {
  console.warn("Database connection error, starting server without DB:", error.message);
  // Start server anyway with mock data
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✓ API running on http://0.0.0.0:${PORT} (Mock data mode - database unavailable)`);
  });
});
