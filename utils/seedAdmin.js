import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "admin@std.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@123",
      10
    );

    await User.create({
      name: "Admin",
      email: "admin@std.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

seedAdmin();