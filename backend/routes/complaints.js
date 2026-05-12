const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const Complaint = require("../models/Complaint");
const ViewLog = require("../models/ViewLog");
const { protect, adminOnly } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// Generate short complaint ID
const generateComplaintId = () => {
  return "AWZ-" + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ─── GET ALL COMPLAINTS (public) ────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const {
      tag,
      status,
      search,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    // Validate search query length to prevent ReDoS attacks
    if (search && search.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query too long. Maximum 100 characters allowed.",
      });
    }

    const filter = {};
    if (tag && tag !== "all") filter.tags = tag;
    if (status) filter.status = status;

    // Escape search string to prevent ReDoS attacks
    if (search) {
      const safeSearch = escapeRegex(search.trim());
      filter.$or = [
        { culpritDesignation: new RegExp(safeSearch, "i") },
        { culpritDesignationOther: new RegExp(safeSearch, "i") },
        { description: new RegExp(safeSearch, "i") },
        { complaintId: new RegExp(safeSearch, "i") },
        { connectedPeople: new RegExp(safeSearch, "i") },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      most_viewed: { views: -1 },
    };

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-filedBy"); // Never expose who filed it

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      complaints,
    });
  } catch (err) {
    console.error("Get complaints error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── GET SINGLE COMPLAINT (public) ──────────────────────────────────────────
router.get("/:complaintId", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
    }).select("-filedBy");

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found." });
    }

    // Get client IP address
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      req.ip;

    // Hash the IP for privacy (never store raw IPs)
    const hashedIp = crypto
      .createHash("sha256")
      .update(clientIp)
      .digest("hex")
      .slice(0, 16);

    // Create view log entry with TTL (auto-deletes after 24 hours)
    const viewKey = complaint._id.toString() + ":" + hashedIp;

    try {
      // Try to create a new view log entry
      await ViewLog.create({ key: viewKey });
      // If create succeeds, it's a new viewer — increment view count
      complaint.views += 1;
      await complaint.save();
    } catch (err) {
      // Duplicate key error (code 11000) = already viewed today, skip increment
      if (err.code !== 11000) throw err;
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.error("Get complaint error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── FILE NEW COMPLAINT (requires auth) ─────────────────────────────────────
router.post(
  "/",
  protect,
  upload.fields([{ name: "proofs", maxCount: 8 }]),
  async (req, res) => {
    try {
      // ─── PER-USER RATE LIMITING ──────────────────────────────────────────────
      // Check daily complaint limit (5 per day)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayCount = await Complaint.countDocuments({
        filedBy: req.user.userId,
        createdAt: { $gte: startOfDay },
      });

      if (todayCount >= 5) {
        return res.status(429).json({
          success: false,
          message:
            "You have reached your daily limit of 5 complaints. Please try again tomorrow.",
        });
      }

      // Check lifetime complaint limit (50 total per account)
      const totalCount = await Complaint.countDocuments({
        filedBy: req.user.userId,
      });

      if (totalCount >= 50) {
        return res.status(429).json({
          success: false,
          message:
            "Account complaint limit reached. Contact support if you believe this is an error.",
        });
      }

      const {
        culpritDesignation,
        culpritDesignationOther,
        connectedPeople,
        tags,
        description,
        legalReferences,
        locationState,
        locationCity,
        otherComplaintType,
      } = req.body;

      // Validations
      if (!culpritDesignation || culpritDesignation.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Culprit designation is required.",
        });
      }

      if (culpritDesignation === "other" && !culpritDesignationOther) {
        return res.status(400).json({
          success: false,
          message: "Custom designation is required when selecting 'Other'.",
        });
      }

      if (!description || description.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: "Description must be at least 50 characters.",
        });
      }

      const tagList = Array.isArray(tags) ? tags : tags ? [tags] : [];
      if (tagList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Select at least one complaint type.",
        });
      }

      if (tagList.includes("other") && !otherComplaintType) {
        return res.status(400).json({
          success: false,
          message: "Complaint type is required when selecting 'Other'.",
        });
      }

      // Proof required
      if (
        !req.files ||
        !req.files["proofs"] ||
        req.files["proofs"].length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "At least one proof file is required.",
        });
      }

      // Upload proof files
      const proofs = [];
      for (const file of req.files["proofs"]) {
        const isPdf = file.mimetype === "application/pdf";
        const result = await uploadToCloudinary(file.buffer, {
          folder: "awaaz/proofs",
          resource_type: isPdf ? "raw" : "image",
          transformation: isPdf ? [] : [{ quality: 65, fetch_format: "auto" }],
        });
        proofs.push({
          url: result.secure_url,
          publicId: result.public_id,
          fileType: isPdf ? "pdf" : "image",
          originalName: file.originalname,
        });
      }

      // Parse connected people
      let connectedList = [];
      if (connectedPeople) {
        connectedList = connectedPeople
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // Generate unique complaint ID
      let complaintId = generateComplaintId();
      while (await Complaint.findOne({ complaintId })) {
        complaintId = generateComplaintId();
      }

      const complaint = await Complaint.create({
        complaintId,
        filedBy: req.user.userId,
        culpritDesignation: culpritDesignation.trim(),
        culpritDesignationOther: culpritDesignationOther
          ? culpritDesignationOther.trim()
          : null,
        connectedPeople: connectedList,
        tags: tagList,
        otherComplaintType: otherComplaintType
          ? otherComplaintType.trim()
          : null,
        description: description.trim(),
        legalReferences: legalReferences ? legalReferences.trim() : "",
        proofs,
        location: {
          state: locationState || "",
          city: locationCity || "",
          country: "India",
        },
      });

      res.status(201).json({
        success: true,
        message: "Complaint filed successfully.",
        complaintId: complaint.complaintId,
      });
    } catch (err) {
      console.error("File complaint error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to file complaint. " + err.message,
      });
    }
  },
);

// ─── MY COMPLAINTS (requires auth) ──────────────────────────────────────────
router.get("/user/my-complaints", protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ filedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .select(
        "complaintId culpritDesignation tags status createdAt views resolutionRequest",
      );

    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── REQUEST RESOLUTION ─────────────────────────────────────────────────────
router.post(
  "/:complaintId/request-resolution",
  protect,
  upload.single("resolutionProof"),
  async (req, res) => {
    try {
      const complaint = await Complaint.findOne({
        complaintId: req.params.complaintId,
      });
      if (!complaint)
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found." });

      if (complaint.filedBy !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: "You can only request resolution for your own complaints.",
        });
      }

      if (complaint.status === "resolved") {
        return res.status(400).json({
          success: false,
          message: "This complaint is already resolved.",
        });
      }

      const { proofNote } = req.body;
      if (!proofNote || proofNote.trim().length < 20) {
        return res.status(400).json({
          success: false,
          message: "Please explain how you got justice (min 20 characters).",
        });
      }

      let proofFile = null;
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: "awaaz/resolutions",
        });
        proofFile = { url: result.secure_url, publicId: result.public_id };
      }

      complaint.status = "resolution-requested";
      complaint.resolutionRequest = {
        requestedAt: new Date(),
        proofNote: proofNote.trim(),
        proofFile,
      };
      await complaint.save();

      res.json({
        success: true,
        message: "Resolution request submitted. Admin will review and confirm.",
      });
    } catch (err) {
      console.error("Resolution request error:", err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
);

// ─── ADMIN: MARK RESOLVED ────────────────────────────────────────────────────
router.patch("/:complaintId/resolve", protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
    });
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found." });

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
    complaint.resolvedNote = req.body.note || "Marked resolved by admin.";
    await complaint.save();

    res.json({ success: true, message: "Complaint marked as resolved." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── ADMIN: REJECT RESOLUTION REQUEST ────────────────────────────────────────
router.patch(
  "/:complaintId/reject-resolution",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const complaint = await Complaint.findOne({
        complaintId: req.params.complaintId,
      });
      if (!complaint)
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found." });

      complaint.status = "active";
      complaint.resolutionRequest = undefined;
      await complaint.save();

      res.json({ success: true, message: "Resolution request rejected." });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
);

// ─── ADMIN: DELETE COMPLAINT ────────────────────────────────────────────────
router.delete("/:complaintId", protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
    });
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found." });

    // Delete all images/files from Cloudinary
    const filesToDelete = [];

    // Culprit image
    if (complaint.culpritImage?.publicId) {
      filesToDelete.push(complaint.culpritImage.publicId);
    }

    // Proof files
    if (complaint.proofs && complaint.proofs.length > 0) {
      complaint.proofs.forEach((proof) => {
        if (proof.publicId) {
          filesToDelete.push(proof.publicId);
        }
      });
    }

    // Resolution proof file
    if (complaint.resolutionRequest?.proofFile?.publicId) {
      filesToDelete.push(complaint.resolutionRequest.proofFile.publicId);
    }

    // Delete files from Cloudinary
    for (const publicId of filesToDelete) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Failed to delete Cloudinary file ${publicId}:`, err);
      }
    }

    // Delete complaint from database
    await Complaint.deleteOne({ _id: complaint._id });

    res.json({
      success: true,
      message: "Complaint and all associated files deleted.",
    });
  } catch (err) {
    console.error("Delete complaint error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── ADMIN: GET PENDING RESOLUTIONS ──────────────────────────────────────────
router.get(
  "/admin/pending-resolutions",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const complaints = await Complaint.find({
        status: "resolution-requested",
      })
        .sort({ "resolutionRequest.requestedAt": 1 })
        .select(
          "complaintId culpritDesignation culpritDesignationOther tags status createdAt resolutionRequest views",
        );

      res.json({ success: true, complaints });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
);

// ─── STATS (public) ──────────────────────────────────────────────────────────
router.get("/public/stats", async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const pending = await Complaint.countDocuments({
      status: "resolution-requested",
    });

    const tagStats = await Complaint.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, stats: { total, resolved, pending, tagStats } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
