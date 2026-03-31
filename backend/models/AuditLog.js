const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actorAddress: {
      type: String,
      default: null
    },
    action: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "voter", "system"],
      default: "system"
    },
    details: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);