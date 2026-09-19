import Order from "../models/Order.js";
import Food from "../models/Food.js";
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      tableNumber,
      items,
      totalAmount,
      paymentMethod,
    } = req.body;

    if (
      !customerName ||
      !phone ||
      !tableNumber ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Missing required order details",
      });
    }

    const order = await Order.create({
      customerName,
      phone,
      tableNumber,
      items,
      totalAmount,
      paymentMethod,
    });
    for (const item of items) {
      await Food.findByIdAndUpdate(item.foodId, {
        $inc: {
          ordered: item.quantity,
        },
      });
    }
    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order can only be cancelled while pending",
      });
    }

    order.status = "cancelled";

    await order.save();
    for (const item of order.items) {
      await Food.findByIdAndUpdate(item.foodId, {
        $inc: {
          ordered: -item.quantity,
        },
      });
    }
    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};
