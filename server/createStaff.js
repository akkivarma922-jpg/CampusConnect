const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URL;

const createStaff = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    const hashedPassword = await bcrypt.hash("Staff@123", 10);

    const existingStaff = await User.findOne({
      email: "staff@campusconnect.com"
    });

    if (existingStaff) {
      existingStaff.name = "Campus Staff";
      existingStaff.password = hashedPassword;
      existingStaff.role = "staff";
      existingStaff.department = "CSE";
      existingStaff.year = 3;
      existingStaff.section = "A";

      await existingStaff.save();

      console.log("Staff account updated successfully");
    } else {
      await User.create({
        name: "Campus Staff",
        email: "staff@campusconnect.com",
        password: hashedPassword,
        role: "staff",
        department: "CSE",
        year: 3,
        section: "A"
      });

      console.log("Staff account created successfully");
    }

    console.log("Email: staff@campusconnect.com");
    console.log("Password: Staff@123");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create staff:");
    console.error(error.message);
  }
};

createStaff();