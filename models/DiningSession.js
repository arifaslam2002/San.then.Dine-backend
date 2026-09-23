import mongoose from "mongoose";

const diningSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    tableNumber: {
      type: String,
      required: true,
    },

    guestCount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["active", "finished", "completed"],
      default: "active",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", null],
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const DiningSession = mongoose.model("DiningSession", diningSessionSchema);

export default DiningSession;
