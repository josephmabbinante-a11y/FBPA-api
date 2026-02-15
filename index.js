import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(cors({ origin: "https://hdhtransport.com", credentials: true }));
app.use(express.json());

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

// Example: Hash a password and log it
const hash = bcrypt.hashSync('pword123', 10);
console.log('Example bcrypt hash for pword123:', hash);

// Serve registration page
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 4000;

// Connect to MongoDB and start server (optional - will work with mock data if DB unavailable)
connectDB().then((connected) => {
  const server = app.listen(PORT, "0.0.0.0", () => {
    const actualPort = server.address().port;
    if (connected) {
      console.log(`✓ API running on http://0.0.0.0:${actualPort} (Database mode)`);
    } else {
      console.log(`✓ API running on http://0.0.0.0:${actualPort} (Mock data mode - no database)`);
    }
  });
}).catch((error) => {
  console.warn("Database connection error, starting server without DB:", error.message);
  // Start server anyway with mock data
  const server = app.listen(PORT, "0.0.0.0", () => {
    const actualPort = server.address().port;
    console.log(`API running on http://0.0.0.0:${actualPort} (Mock mode - database unavailable)`);
  });
});
