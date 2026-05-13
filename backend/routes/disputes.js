const express = require("express");
const router = express.Router();
const Dispute = require("../models/Dispute");
const Complaint = require("../models/Complaint");
const { protect, adminOnly } = require("../middleware/auth");
const { upload, uploadToCloudinary } = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

// ─── ADMIN ROUTES (must come first to avoid conflicts) ─────────────────────

// Get all disputes with filter (admin only)
router.get("/admin/pending", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "pending" } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await Dispute.countDocuments(filter);
    const disputes = await Dispute.find(filter)
      .populate("submittedBy", "email userId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      disputes,
    });
  } catch (err) {
    console.error("Get pending disputes error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Get single dispute detail (admin only)
router.get("/admin/:disputeId", protect, adminOnly, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId)
      .populate("submittedBy", "email userId")
      .populate("reviewedBy", "email");

    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found." });
    }

    // Also get the related complaint
    const complaint = await Complaint.findOne({
      complaintId: dispute.complaintId,
    });

    res.json({
      success: true,
      dispute,
      complaint,
    });
  } catch (err) {
    console.error("Get dispute detail error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Verify/Approve dispute (admin only)
router.put("/admin/:disputeId/verify", protect, adminOnly, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { reviewNotes } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      {
        status: "verified",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "",
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found." });
    }

    res.json({
      success: true,
      message: "Dispute verified and will now be displayed on the complaint.",
      dispute,
    });
  } catch (err) {
    console.error("Verify dispute error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Reject dispute (admin only)
router.put("/admin/:disputeId/reject", protect, adminOnly, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { reviewNotes } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      disputeId,
      {
        status: "rejected",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || "",
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found." });
    }

    res.json({
      success: true,
      message: "Dispute rejected.",
      dispute,
    });
  } catch (err) {
    console.error("Reject dispute error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── USER ROUTES ───────────────────────────────────────────────────────────

// Get my disputes (current user's submitted disputes)
router.get("/user/my-disputes", protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      submittedBy: req.user._id,
    })
      .populate("submittedBy", "email userId")
      .sort({ createdAt: -1 });

    // Also get complaint details for each dispute
    const disputesWithComplaints = await Promise.all(
      disputes.map(async (d) => {
        const complaint = await Complaint.findOne({
          complaintId: d.complaintId,
        });
        return {
          ...d.toObject(),
          complaint,
        };
      }),
    );

    res.json({
      success: true,
      disputes: disputesWithComplaints,
    });
  } catch (err) {
    console.error("Get my disputes error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── PUBLIC & USER ROUTES ──────────────────────────────────────────────────

// Submit a dispute
router.post(
  "/:complaintId/submit",
  protect,
  upload.array("proofs", 5),
  async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { argument } = req.body;

      // Check if account is at least 48 hours old
      const accountAgeInMs =
        Date.now() - new Date(req.user.createdAt).getTime();
      const fortyEightHoursInMs = 48 * 60 * 60 * 1000;

      if (accountAgeInMs < fortyEightHoursInMs) {
        const hoursRemaining = Math.ceil(
          (fortyEightHoursInMs - accountAgeInMs) / (60 * 60 * 1000),
        );
        return res.status(403).json({
          success: false,
          message: `New accounts must be at least 48 hours old to file disputes. Please wait ${hoursRemaining} more hours.`,
        });
      }

      // Validate inputs
      if (!argument || argument.trim().length < 50) {
        return res.status(400).json({
          success: false,
          message: "Argument must be at least 50 characters long.",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one proof file (image or PDF) is required.",
        });
      }

      // Verify complaint exists
      const complaint = await Complaint.findOne({ complaintId });
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found." });
      }

      // Check if dispute already exists (prevent duplicates)
      const existingDispute = await Dispute.findOne({
        complaintId,
        submittedBy: req.user._id,
        status: { $in: ["pending", "verified"] },
      });

      if (existingDispute) {
        return res.status(400).json({
          success: false,
          message:
            "You already have a pending or verified dispute for this complaint.",
        });
      }

      // Upload proofs to Cloudinary
      const proofs = [];
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer, {
            folder: `awaaz/disputes`,
            resource_type: "auto",
          });

          const fileType = file.mimetype.startsWith("image") ? "image" : "pdf";
          proofs.push({
            url: result.secure_url,
            publicId: result.public_id,
            fileType,
            originalName: file.originalname,
          });
        } catch (uploadErr) {
          console.error("Cloudinary upload error:", uploadErr);
          return res.status(500).json({
            success: false,
            message: "Failed to upload proof file.",
          });
        }
      }

      // Create dispute
      const dispute = new Dispute({
        complaintId,
        submittedBy: req.user._id,
        argument: argument.trim(),
        proofs,
        status: "pending",
      });

      await dispute.save();

      res.status(201).json({
        success: true,
        message:
          "Dispute submitted successfully. Admin will review it shortly.",
        dispute,
      });
    } catch (err) {
      console.error("Submit dispute error:", err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
);

// Get verified disputes for a complaint (public)
router.get("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Get only verified disputes for public view
    const disputes = await Dispute.find({
      complaintId,
      status: "verified",
    })
      .select("argument proofs status createdAt reviewedAt reviewNotes") // Explicitly include proofs and exclude submittedBy
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      disputes,
    });
  } catch (err) {
    console.error("Get disputes error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Delete dispute (admin or submitter)
router.delete("/:disputeId", protect, async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId);

    if (!dispute) {
      return res
        .status(404)
        .json({ success: false, message: "Dispute not found." });
    }

    // Check if user is admin or the dispute submitter
    if (
      !req.user.isAdmin &&
      dispute.submittedBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Delete proofs from Cloudinary
    for (const proof of dispute.proofs) {
      try {
        await cloudinary.uploader.destroy(proof.publicId);
      } catch (err) {
        console.error("Cloudinary deletion error:", err);
      }
    }

    await Dispute.findByIdAndDelete(req.params.disputeId);

    res.json({
      success: true,
      message: "Dispute deleted successfully.",
    });
  } catch (err) {
    console.error("Delete dispute error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
