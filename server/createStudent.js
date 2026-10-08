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
      email: "student.csea@campusconnect.com"
    });

    if (existingStudent) {
      existingStudent.name = "CSE 3A Student";
      existingStudent.password = hashedPassword;
      existingStudent.role = "student";
      existingStudent.department = "CSE";
      existingStudent.year = 3;
      existingStudent.section = "A";
      existingStudent.crId = undefined;

      await existingStudent.save();

      console.log("Student account updated successfully");
    } else {
      await User.create({
        name: "CSE 3A Student",
        email: "student.csea@campusconnect.com",
        password: hashedPassword,
        role: "student",
        department: "CSE",
        year: 3,
        section: "A"
      });

      console.log("Student account created successfully");
    }

    console.log(
      "Email: student.csea@campusconnect.com"
    );
    console.log("Password: Student@123");
    console.log("Class: CSE 3A");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create student:");
    console.error(error.message);
  }
};

createStudent();