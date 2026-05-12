require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const disputeRoutes = require("./routes/disputes");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── BODY PARSING ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, message: "Too many requests. Please slow down." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many auth attempts. Try again later.",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 complaints per hour per IP
  message: {
    success: false,
    message: "Too many complaints submitted. Please wait.",
  },
});

app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);
app.use("/api/complaints", (req, res, next) => {
  if (req.method === "POST" && req.path === "/")
    return uploadLimiter(req, res, next);
  next();
});

// ─── ROUTES ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/disputes", disputeRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Awaaz API is running.",
    timestamp: new Date(),
  });
});

// ─── SERVE FRONTEND (optional, if hosting together) ──────────────────────────
// Serve all static assets (CSS, JS, images, fonts, etc.)
app.use(express.static(path.join(__dirname, "../frontend")));

// SPA fallback: Serve index.html for any non-API routes (client-side routing)
// This allows the frontend to handle its own routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ success: false, message: "File too large. Max 15MB per file." });
  }
  if (err.message) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ─── DATABASE + START ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Awaaz server running on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
