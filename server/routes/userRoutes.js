const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const user = await User.findById(req.session.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Authorization failed",
      error: error.message
    });
  }
};

router.get("/", requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      year,
      section,
      crId
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required"
      });
    }

    const validRoles = ["student", "cr", "staff", "admin"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "A user with this email already exists"
      });
    }

    if (role === "cr" && !crId) {
      return res.status(400).json({
        message: "CR ID is required for CR accounts"
      });
    }

    if (role === "cr" && crId) {
      const existingCR = await User.findOne({ crId });

      if (existingCR) {
        return res.status(409).json({
          message: "This CR ID is already assigned"
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      department: department || "",
      year: year ? Number(year) : undefined,
      section: section || "",
      crId: role === "cr" ? crId : undefined
    });

    const safeUser = await User.findById(user._id).select("-password");

    res.status(201).json({
      message: "User created successfully",
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message
    });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      year,
      section,
      crId
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user._id.toString() === req.currentUser._id.toString()) {
      if (role && role !== "admin") {
        return res.status(400).json({
          message: "You cannot change your own admin role"
        });
      }
    }

    const validRoles = ["student", "cr", "staff", "admin"];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();

      const emailUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });

      if (emailUser) {
        return res.status(409).json({
          message: "Another user already has this email"
        });
      }

      user.email = normalizedEmail;
    }

    if (name) {
      user.name = name.trim();
    }

    if (role) {
      user.role = role;
    }

    user.department = department || "";
    user.year = year ? Number(year) : undefined;
    user.section = section || "";

    if (user.role === "cr") {
      if (!crId) {
        return res.status(400).json({
          message: "CR ID is required for CR accounts"
        });
      }

      const existingCR = await User.findOne({
        crId,
        _id: { $ne: user._id }
      });

      if (existingCR) {
        return res.status(409).json({
          message: "This CR ID is already assigned"
        });
      }

      user.crId = crId;
    } else {
      user.crId = undefined;
    }

    if (password && password.trim()) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.json({
      message: "User updated successfully",
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user._id.toString() === req.currentUser._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
});

module.exports = router;