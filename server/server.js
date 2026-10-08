const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");

const Issue = require("./models/Issue");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URL;

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "campusconnect_secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "CampusConnect Backend is running!",
    status: "success"
  });
});

app.get("/report", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .populate("assignedStaff", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      total: issues.length,

      reported: issues.filter(
        issue => issue.status === "REPORTED"
      ).length,

      inProgress: issues.filter(
        issue =>
          issue.status === "ACKNOWLEDGED" ||
          issue.status === "IN_PROGRESS" ||
          issue.status === "AWAITING_VERIFICATION"
      ).length,

      resolved: issues.filter(
        issue => issue.status === "RESOLVED"
      ).length
    };

    res.render("issueReport", {
      issues,
      stats
    });
  } catch (error) {
    res.status(500).send(
      "Failed to generate issue report: " +
      error.message
    );
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/issues", issueRoutes);

app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

const startServer = async () => {
  try {
    if (!MONGODB_URI) {
      console.error(
        "MongoDB connection string is missing in .env"
      );
      return;
    }

    await mongoose.connect(MONGODB_URI);

    console.log(
      "MongoDB connected to CampusConnect database"
    );

    app.listen(PORT, () => {
      console.log(
        `CampusConnect server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "MongoDB connection failed:"
    );

    console.error(error.message);
  }
};

startServer();