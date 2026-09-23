import DiningSession from "../models/DiningSession.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
export const createDiningSession = async (req, res) => {
  try {
    const { tableNumber, guestCount } = req.body;

    if (!tableNumber || !guestCount) {
      return res.status(400).json({
        message: "Table number and guest count are required",
      });
    }

    const table = await Table.findOne({ tableNumber });

    if (!table) {
      return res.status(404).json({
        message: "Table not found",
      });
    }

    if (!table.active) {
      return res.status(400).json({
        message: "Table is not active",
      });
    }

    if (guestCount > table.capacity) {
      return res.status(400).json({
        message: `This table can accommodate a maximum of ${table.capacity} people`,
      });
    }

    const existingSession = await DiningSession.findOne({
      tableNumber,
      status: "active",
    });

    if (existingSession) {
      return res.status(400).json({
        message: "This table already has an active dining session",
        session: existingSession,
      });
    }

    const session = await DiningSession.create({
      sessionId: `SES-${Date.now()}`,
      tableNumber,
      guestCount,
    });

    table.status = "occupied";
    await table.save();

    res.status(201).json({
      message: "Dining session created successfully",
      session,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create dining session",
      error: error.message,
    });
  }
};
export const getDiningSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await DiningSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Dining session not found",
      });
    }

    const orders = await Order.find({
      sessionId,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      session,
      orders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dining session",
      error: error.message,
    });
  }
};
export const finishDiningSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await DiningSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Dining session not found",
      });
    }

    if (session.status !== "active") {
      return res.status(400).json({
        message: "This dining session is already finished",
      });
    }

    session.status = "finished";
    session.completedAt = null;

    await session.save();

    res.status(200).json({
      message: "Dining session finished successfully",
      session,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to finish dining session",
      error: error.message,
    });
  }
};
export const getPendingPayments = async (req, res) => {
  try {
    const sessions = await DiningSession.find({
      status: "finished",
      paymentStatus: "pending",
    }).sort({ updatedAt: 1 });

    const payments = [];

    for (const session of sessions) {
      const orders = await Order.find({
        sessionId: session.sessionId,
      });

      const customerOrder = orders[0];
      let totalAmount = 0;

      orders.forEach((order) => {
        order.items.forEach((item) => {
          const addonsTotal = (item.addons || []).reduce(
            (total, addon) => total + Number(addon.price || 0),
            0,
          );

          totalAmount += (Number(item.price) + addonsTotal) * item.quantity;
        });
      });

      payments.push({
        sessionId: session.sessionId,
        tableNumber: session.tableNumber,
        guestCount: session.guestCount,
        paymentMethod: session.paymentMethod,
        paymentStatus: session.paymentStatus,
        totalAmount,
        requestedAt: session.updatedAt,
        customerName: customerOrder?.customerName || "Guest",
        phone: customerOrder?.phone || "",
      });
    }

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch pending payments",
    });
  }
};
export const requestPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { paymentMethod } = req.body;

    const allowedMethods = ["cash", "upi", "card"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const session = await DiningSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Dining session not found",
      });
    }

    if (session.status !== "finished") {
      return res.status(400).json({
        message: "Dining session must be finished before payment",
      });
    }

    if (session.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Payment has already been completed",
      });
    }

    session.paymentMethod = paymentMethod;
    session.paymentStatus = "pending";

    await session.save();

    res.status(200).json({
      message: "Payment request submitted",
      session,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to request payment",
      error: error.message,
    });
  }
};
export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await DiningSession.findOne({
      sessionId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Dining session not found",
      });
    }

    if (session.status !== "finished") {
      return res.status(400).json({
        message: "Dining session is not ready for payment confirmation",
      });
    }

    if (session.paymentStatus !== "pending") {
      return res.status(400).json({
        message: "Payment is not pending",
      });
    }

    session.paymentStatus = "paid";
    session.status = "completed";
    session.completedAt = new Date();

    await session.save();

    const table = await Table.findOne({
      tableNumber: session.tableNumber,
    });

    if (table) {
      table.status = "available";
      await table.save();
    }

    res.status(200).json({
      message: "Payment confirmed successfully",
      session,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};
