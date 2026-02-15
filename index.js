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

// Serve registration page
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

// Use the port from environment variable or default to 4000
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Connect to MongoDB and start server (optional - will work with mock data if DB unavailable)
connectDB().then((connected) => {
    app.listen(PORT, "localhost", () => {
      const actualPort = app.address ? app.address().port : PORT;
      if (connected) {
        console.log(`✓ API running on http://localhost:${actualPort} (Database mode)`);
      } else {
        console.log(`✓ API running on http://localhost:${actualPort} (Mock data mode - no database)`);
      }
    });
}).catch((error) => {
    console.warn("Database connection error, starting server without DB:", error.message);
  // Start server anyway with mock data
    app.listen(PORT, "localhost", () => {
      const actualPort = app.address ? app.address().port : PORT;
      console.log(`API running on http://localhost:${actualPort} (Mock mode - database unavailable)`);
    });
  });
