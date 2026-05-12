const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  // Complaint ID (public facing, short)
  complaintId: {
    type: String,
    required: true,
    unique: true,
  },

  // Filed by (anonymous user ID reference)
  filedBy: {
    type: String,
    required: true, // stores userId string (not ObjectId, for extra anonymity)
  },

  // Culprit info
  culpritDesignation: {
    type: String,
    enum: [
      "doctor",
      "politician",
      "teacher",
      "police-officer",
      "judge",
      "government-official",
      "corporate-executive",
      "healthcare-worker",
      "educator",
      "business-owner",
      "landlord",
      "family-member",
      "other",
    ],
    required: true,
  },
  culpritDesignationOther: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  culpritName: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  culpritImage: {
    url: String,
    publicId: String,
  },

  // Connected people (accomplices)
  connectedPeople: [
    {
      type: String,
      trim: true,
      maxlength: 200,
    },
  ],

  // Complaint category tags
  tags: [
    {
      type: String,
      enum: [
        "harassment",
        "fraud",
        "domestic-violence",
        "cybercrime",
        "bribery-corruption",
        "police-negligence",
        "land-dispute",
        "financial-fraud",
        "sexual-harassment",
        "workplace-abuse",
        "child-abuse",
        "human-trafficking",
        "medical-negligence",
        "other",
      ],
    },
  ],

  // Other complaint type (when user selects 'other' tag)
  otherComplaintType: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  // The complaint narrative
  description: {
    type: String,
    required: true,
    minlength: 50,
  },

  // Legal references (IPC sections, articles etc)
  legalReferences: {
    type: String,
    trim: true,
    maxlength: 1000,
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
    enum: ["active", "resolution-requested", "resolved"],
    default: "active",
  },

  // Resolution request
  resolutionRequest: {
    requestedAt: Date,
    proofNote: String, // user explains how they got justice
    proofFile: {
      url: String,
      publicId: String,
    },
  },

  // Resolved by admin
  resolvedAt: Date,
  resolvedNote: String,

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  // Location (optional, user-provided)
  location: {
    state: String,
    city: String,
    country: {
      type: String,
      default: "India",
    },
  },

  // View count
  views: {
    type: Number,
    default: 0,
  },
});

// Update updatedAt on save
complaintSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for searching and filtering
complaintSchema.index({ tags: 1, status: 1, createdAt: -1 });
complaintSchema.index({ culpritName: "text", description: "text" });

module.exports = mongoose.model("Complaint", complaintSchema);
