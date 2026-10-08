const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URL;

const createStudent = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    const hashedPassword = await bcrypt.hash(
      "Student@123",
      10
    );

    const existingStudent = await User.findOne({
      email: "student.cseb@campusconnect.com"
    });

    if (existingStudent) {
      existingStudent.name = "CSE 3B Student";
      existingStudent.password = hashedPassword;
      existingStudent.role = "student";
      existingStudent.department = "CSE";
      existingStudent.year = 3;
      existingStudent.section = "B";
      existingStudent.crId = undefined;

      await existingStudent.save();

      console.log("CSE 3B student account updated successfully");
    } else {
      await User.create({
        name: "CSE 3B Student",
        email: "student.cseb@campusconnect.com",
        password: hashedPassword,
        role: "student",
        department: "CSE",
        year: 3,
        section: "B"
      });

      console.log("CSE 3B student account created successfully");
    }

    console.log("Email: student.cseb@campusconnect.com");
    console.log("Password: Student@123");
    console.log("Class: CSE 3B");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create CSE 3B student:");
    console.error(error.message);
  }
};

createStudent();