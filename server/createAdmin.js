const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function resetAdminPassword() {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.MONGODB_URL;

    if (!mongoURI) {
      throw new Error("MongoDB connection string is missing in .env");
    }

    await mongoose.connect(mongoURI);

    const email = "admin@campusconnect.com";
    const password = "Admin@123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.findOneAndUpdate(
      { email: email },
      {
        name: "CampusConnect Admin",
        email: email,
        password: hashedPassword,
        role: "admin"
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!admin) {
      await User.create({
        name: "CampusConnect Admin",
        email: email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("Admin account created successfully!");
    } else {
      console.log("Admin password reset successfully!");
    }

    console.log("");
    console.log("Login credentials:");
    console.log("Email: admin@campusconnect.com");
    console.log("Password: Admin@123");

  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword();