import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seedStaff = async () => {
  try {
    await connectDB();

    const kitchenPassword = "Kitchen@123";
    const counterPassword = "Counter@123";

    const kitchenHash = await bcrypt.hash(kitchenPassword, 10);
    const counterHash = await bcrypt.hash(counterPassword, 10);

    await User.findOneAndUpdate(
      { email: "kitchen@scanthendine.com" },
      {
        name: "Kitchen Staff",
        email: "kitchen@scanthendine.com",
        password: kitchenHash,
        role: "kitchen",
      },
      {
        upsert: true,
        new: true,
      },
    );

    await User.findOneAndUpdate(
      { email: "counter@scanthendine.com" },
      {
        name: "Counter Staff",
        email: "counter@scanthendine.com",
        password: counterHash,
        role: "counter",
      },
      {
        upsert: true,
        new: true,
      },
    );

    console.log("Kitchen staff created/updated");
    console.log("Counter staff created/updated");

    process.exit(0);
  } catch (error) {
    console.error("Staff seed failed:", error);
    process.exit(1);
  }
};

seedStaff();