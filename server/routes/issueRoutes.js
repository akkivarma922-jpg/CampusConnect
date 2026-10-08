const express = require("express");
const Issue = require("../models/Issue");
const User = require("../models/User");

const router = express.Router();

const requireLogin = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Login required"
      });
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Authentication failed",
      error: error.message
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.currentUser.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
};

const requireCR = (req, res, next) => {
  if (req.currentUser.role !== "cr") {
    return res.status(403).json({
      message: "Class Representative access required"
    });
  }

  next();
};

const requireStaff = (req, res, next) => {
  if (req.currentUser.role !== "staff") {
    return res.status(403).json({
      message: "Staff access required"
    });
  }

  next();
};

const requireStudent = (req, res, next) => {
  if (req.currentUser.role !== "student") {
    return res.status(403).json({
      message: "Student access required"
    });
  }

  next();
};

/*
  PUBLIC HOME PAGE SUMMARY

  Only aggregate information is returned.
  No class, department, year, section,
  description, reporter or staff information
  is exposed publicly.
*/
router.get("/public-summary", async (req, res) => {
  try {
    const total = await Issue.countDocuments();

    const resolved = await Issue.countDocuments({
      status: "RESOLVED"
    });

    const inProgress = await Issue.countDocuments({
      status: {
        $in: [
          "REPORTED",
          "ACKNOWLEDGED",
          "IN_PROGRESS",
          "WORK_COMPLETED",
          "AWAITING_VERIFICATION",
          "REOPENED",
          "ESCALATED"
        ]
      }
    });

    res.json({
      total,
      resolved,
      inProgress
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load public issue summary",
      error: error.message
    });
  }
});

/*
  CREATE ISSUE
  CR only
*/
router.post(
  "/",
  requireLogin,
  requireCR,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        location,
        priority
      } = req.body;

      if (!title || !description || !category || !location) {
        return res.status(400).json({
          message:
            "Title, description, category and location are required"
        });
      }

      const issue = await Issue.create({
        title,
        description,
        category,
        location,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section,
        reportedBy: req.currentUser._id,
        priority: priority || "Medium",
        status: "REPORTED",
        history: [
          {
            action: "Issue reported",
            by: req.currentUser._id
          }
        ]
      });

      res.status(201).json({
        message: "Issue created successfully",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create issue",
        error: error.message
      });
    }
  }
);

/*
  ADMIN
  GET ALL ISSUES
*/
router.get(
  "/",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const issues = await Issue.find()
        .populate("reportedBy", "name email")
        .populate("assignedStaff", "name email")
        .sort({ createdAt: -1 });

      res.json(issues);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load issues",
        error: error.message
      });
    }
  }
);

/*
  CR
  GET ISSUES FOR OWN CLASS
*/
router.get(
  "/my-class",
  requireLogin,
  requireCR,
  async (req, res) => {
    try {
      const issues = await Issue.find({
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      })
        .populate("reportedBy", "name email")
        .populate("assignedStaff", "name email")
        .sort({ createdAt: -1 });

      res.json(issues);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load class issues",
        error: error.message
      });
    }
  }
);

/*
  STUDENT
  GET ISSUES FOR OWN CLASS
*/
router.get(
  "/student-class",
  requireLogin,
  requireStudent,
  async (req, res) => {
    try {
      const issues = await Issue.find({
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      })
        .select(
          "title description category location department year section priority status createdAt completedAt verifiedAt resolvedAt"
        )
        .sort({ createdAt: -1 });

      res.json(issues);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load student class issues",
        error: error.message
      });
    }
  }
);

/*
  STUDENT
  GET SINGLE ISSUE FROM OWN CLASS
*/
router.get(
  "/student-class/:id",
  requireLogin,
  requireStudent,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      }).select(
        "title description category location department year section priority status createdAt completedAt verifiedAt resolvedAt"
      );

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      res.json(issue);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load issue",
        error: error.message
      });
    }
  }
);

/*
  CR
  GET SINGLE ISSUE FROM OWN CLASS
*/
router.get(
  "/my-class/:id",
  requireLogin,
  requireCR,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      })
        .populate("reportedBy", "name email")
        .populate("assignedStaff", "name email");

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      res.json(issue);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load issue",
        error: error.message
      });
    }
  }
);

/*
  STAFF
  GET ACTIVE ISSUES FOR STAFF

  Staff can see issues that require action,
  including reopened and escalated issues.
*/
router.get(
  "/staff",
  requireLogin,
  requireStaff,
  async (req, res) => {
    try {
      const issues = await Issue.find({
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section,
        status: {
          $in: [
            "REPORTED",
            "ACKNOWLEDGED",
            "IN_PROGRESS",
            "REOPENED",
            "ESCALATED"
          ]
        }
      })
        .populate("reportedBy", "name email")
        .populate("assignedStaff", "name email")
        .sort({ createdAt: -1 });

      res.json(issues);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load staff issues",
        error: error.message
      });
    }
  }
);

/*
  STAFF
  ACKNOWLEDGE ISSUE
*/
router.put(
  "/:id/acknowledge",
  requireLogin,
  requireStaff,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      });

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      issue.status = "ACKNOWLEDGED";
      issue.acknowledgedAt = new Date();
      issue.assignedStaff = req.currentUser._id;

      issue.history.push({
        action: "Issue acknowledged by staff",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Issue acknowledged",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to acknowledge issue",
        error: error.message
      });
    }
  }
);

/*
  STAFF
  START WORK
*/
router.put(
  "/:id/start",
  requireLogin,
  requireStaff,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      });

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      issue.status = "IN_PROGRESS";
      issue.startedAt = new Date();
      issue.assignedStaff = req.currentUser._id;

      issue.history.push({
        action: "Work started by staff",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Work started",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to start work",
        error: error.message
      });
    }
  }
);

/*
  STAFF
  COMPLETE WORK
*/
router.put(
  "/:id/complete",
  requireLogin,
  requireStaff,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      });

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      issue.status = "AWAITING_VERIFICATION";
      issue.completedAt = new Date();
      issue.assignedStaff = req.currentUser._id;

      issue.history.push({
        action: "Work completed by staff",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Work completed. Waiting for CR verification.",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to complete work",
        error: error.message
      });
    }
  }
);

/*
  CR
  VERIFY AND RESOLVE
*/
router.put(
  "/:id/verify",
  requireLogin,
  requireCR,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      });

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      if (issue.status !== "AWAITING_VERIFICATION") {
        return res.status(400).json({
          message: "Only completed issues can be verified"
        });
      }

      issue.status = "RESOLVED";
      issue.verifiedAt = new Date();
      issue.resolvedAt = new Date();

      issue.history.push({
        action: "Resolution verified by Class Representative",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Issue verified and resolved",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to verify issue",
        error: error.message
      });
    }
  }
);

/*
  CR
  REOPEN ISSUE
*/
router.put(
  "/:id/reopen",
  requireLogin,
  requireCR,
  async (req, res) => {
    try {
      const issue = await Issue.findOne({
        _id: req.params.id,
        department: req.currentUser.department,
        year: req.currentUser.year,
        section: req.currentUser.section
      });

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      if (issue.status !== "AWAITING_VERIFICATION") {
        return res.status(400).json({
          message: "Only completed issues can be reopened"
        });
      }

      issue.status = "REOPENED";

      issue.history.push({
        action: "Issue reopened by Class Representative",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Issue reopened",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to reopen issue",
        error: error.message
      });
    }
  }
);

/*
  ADMIN
  GET SINGLE ISSUE
*/
router.get(
  "/:id",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const issue = await Issue.findById(req.params.id)
        .populate("reportedBy", "name email")
        .populate("assignedStaff", "name email");

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      res.json(issue);
    } catch (error) {
      res.status(500).json({
        message: "Failed to load issue",
        error: error.message
      });
    }
  }
);

/*
  ADMIN
  UPDATE ISSUE
*/
router.put(
  "/:id",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const allowedFields = [
        "title",
        "description",
        "category",
        "location",
        "department",
        "year",
        "section",
        "priority",
        "status",
        "assignedStaff",
        "resolution"
      ];

      const updates = {};

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const issue = await Issue.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true
        }
      );

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      issue.history.push({
        action: "Issue updated by administrator",
        by: req.currentUser._id
      });

      await issue.save();

      res.json({
        message: "Issue updated successfully",
        issue
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update issue",
        error: error.message
      });
    }
  }
);

/*
  ADMIN
  DELETE ISSUE
*/
router.delete(
  "/:id",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    try {
      const issue = await Issue.findByIdAndDelete(req.params.id);

      if (!issue) {
        return res.status(404).json({
          message: "Issue not found"
        });
      }

      res.json({
        message: "Issue deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete issue",
        error: error.message
      });
    }
  }
);

module.exports = router;