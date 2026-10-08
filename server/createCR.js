const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createCR() {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URL;

    if (!mongoURI) {
      throw new Error("MongoDB connection string is missing in .env");
    }

    await mongoose.connect(mongoURI);

    const crData = {
      name: "CSE Class Representative",
      email: "cr.csea@campusconnect.com",
      password: "CR@123",
      role: "cr",
      department: "CSE",
      year: 3,
      section: "A",
      crId: "CR-CSEA-01"
    };

    const existingCR = await User.findOne({
      email: crData.email
    });

    if (existingCR) {
      console.log("CR account already exists.");
      console.log("");
      console.log("CR Login Credentials:");
      console.log("Email:", crData.email);
      console.log("Password:", crData.password);
      console.log("CR ID:", crData.crId);
      return;
    }

    const hashedPassword = await bcrypt.hash(crData.password, 10);

    await User.create({
      name: crData.name,
      email: crData.email,
      password: hashedPassword,
      role: crData.role,
      department: crData.department,
      year: crData.year,
      section: crData.section,
      crId: crData.crId
    });

    console.log("CR account created successfully!");
    console.log("");
    console.log("CR Login Credentials:");
    console.log("Email:", crData.email);
    console.log("Password:", crData.password);
    console.log("CR ID:", crData.crId);
    console.log("");
    console.log("Class: CSE - 3A");

  } catch (error) {
    console.error("CR creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createCR();