const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID and password are required.",
        });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
    }

    const existing = await User.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "This User ID is already taken. Choose another.",
        });
    }

    const user = await User.create({ userId, password });

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: { userId: user.userId, isAdmin: user.isAdmin },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors)
        .map((e) => e.message)
        .join(". ");
      return res.status(400).json({ success: false, message: msg });
    }
    console.error("Register error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID and password are required.",
        });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid User ID or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid User ID or password." });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: { userId: user.userId, isAdmin: user.isAdmin },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error. Please try again." });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: { userId: req.user.userId, isAdmin: req.user.isAdmin },
  });
});

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  try {
    const { userId, password, adminPassword } = req.body;

    // Check if user exists and password is correct
    const user = await User.findOne({ userId });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    // Check if user is marked as admin
    if (!user.isAdmin) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not authorized to access the admin panel.",
        });
    }

    // Check if admin secret key is correct
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid admin secret key." });
    }

    const token = signToken(user._id);
    res.json({
      success: true,
      message: "Admin login successful.",
      token,
      user: { userId: user.userId, isAdmin: true },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
