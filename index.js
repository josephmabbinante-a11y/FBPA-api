import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./db/connection.js";
import invoiceRoutes from "./routes/invoices.js";
import auditRoutes from "./routes/audits.js";
import exceptionRoutes from "./routes/exceptions.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportsRoutes from "./routes/reports.js";
import uploadsRoutes from "./routes/uploads.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(`
    <h2>Welcome to the FBPA API</h2>
    <p><a href='/login.html'>Login</a></p>
    <p><a href='/register.html'>Register a new user</a></p>
    <p>Auth endpoint: <code>POST /api/v1/auth/login</code></p>
  `);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/invoices", invoiceRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/exceptions", exceptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/uploads", uploadsRoutes);

// Auth routes: keep legacy and current prefixes for dev compatibility
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
  })
  .catch((error) => {
    console.warn("Database connection error, starting server without DB:", error.message);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API running on http://0.0.0.0:${PORT} (Mock mode - database unavailable)`);
    });
  });
