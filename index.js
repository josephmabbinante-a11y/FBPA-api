import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";

dotenv.config();


// Initialize Express app
const app = express();
console.log('Express initialized');

// Enable CORS for all routes
app.use(cors());
console.log('CORS middleware enabled');

// Enable JSON body parsing
app.use(express.json());
console.log('express.json() middleware enabled');


// Root route: show welcome or redirect to register
app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to the FBPA API</h2>
    <p><a href='/register.html'>Register a new user</a></p>
    <p>API is running. Try <a href='/api/v1/auth/login'>/api/v1/auth/login</a> (POST) for login.</p>
  `);
});

app.get("/health", (req, res) => {
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
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 4000;

connectDB()
  .then((connected) => {
    app.listen(PORT, "0.0.0.0", () => {
      if (connected) {
        console.log(`API running on http://0.0.0.0:${PORT} (Database mode)`);
      } else {
        console.log(`API running on http://0.0.0.0:${PORT} (Mock mode - database unavailable)`);
      }
    });
}).catch((error) => {
    console.warn("Database connection error, starting server without DB:", error.message);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on http://0.0.0.0:${PORT} (Mock mode - database unavailable)`);
    });
  });
