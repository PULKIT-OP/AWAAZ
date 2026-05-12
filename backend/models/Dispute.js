const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema({
  // Reference to the complaint being disputed
  complaintId: {
    type: String,
    required: true, // stores complaintId string (e.g., "AWZ-XXXXX")
  },

  // The person submitting the dispute (blamed person)
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Dispute argument/explanation (text)
  argument: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 5000,
  },

  // Proof files (images/PDFs on Cloudinary)
  proofs: [
    {
      url: String,
      publicId: String,
      fileType: {
        type: String,
        enum: ["image", "pdf"],
      },
      originalName: String,
    },
  ],

  // Status
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  // Admin review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: Date,
  reviewNotes: {
    type: String,
    maxlength: 1000,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dispute", disputeSchema);
