const mongoose = require("mongoose");

// Track complaint views with TTL-based automatic cleanup
// IP addresses are hashed for privacy
const viewLogSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  }, // Format: "complaintObjectId:hashedIp"
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // TTL: 24 hours (in seconds)
  },
});

module.exports = mongoose.model("ViewLog", viewLogSchema);
