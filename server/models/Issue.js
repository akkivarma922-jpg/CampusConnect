const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true
    },

    year: {
      type: Number,
      required: true
    },

    section: {
      type: String,
      required: true
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },

    status: {
      type: String,
      enum: [
        "REPORTED",
        "ACKNOWLEDGED",
        "IN_PROGRESS",
        "WORK_COMPLETED",
        "AWAITING_VERIFICATION",
        "RESOLVED",
        "REOPENED",
        "ESCALATED"
      ],
      default: "REPORTED"
    },

    resolution: {
      type: String,
      default: ""
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    acknowledgedAt: {
      type: Date,
      default: null
    },

    startedAt: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    history: [
      {
        action: String,
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        at: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Issue", issueSchema);