import dotenv from "dotenv";
import mongoose from "mongoose";
import Table from "../models/Table.js";

dotenv.config();

const tables = [
  "T-01",
  "T-02",
  "T-03",
  "T-04",
  "T-05",
  "T-06",
  "T-07",
  "T-08",
  "T-09",
  "T-10",
];

const seedTables = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    for (const tableNumber of tables) {
      await Table.findOneAndUpdate(
        { tableNumber },
        { tableNumber },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    }

    console.log("Tables seeded successfully");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to seed tables:", error);
    process.exit(1);
  }
};

seedTables();
