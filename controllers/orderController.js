import Order from "../models/Order.js";
import Food from "../models/Food.js";
import Table from "../models/Table.js";
import { getIO } from "../utils/socket.js";
export const createOrder = async (req, res) => {
  try {
    const {
      orderType = "dine-in",
      customerName,
      phone,
      tableNumber,
      items,
      guestCount,
      sessionId,
      totalAmount,
      paymentMethod,
    } = req.body;

    // Validate order type
    if (!["dine-in", "parcel"].includes(orderType)) {
      return res.status(400).json({
        message: "Invalid order type",
      });
    }

    // Table is required only for dine-in orders
    if (orderType === "dine-in" && !tableNumber) {
      return res.status(400).json({
        message: "Table number is required for dine-in orders",
      });
    }
    let table = null;

    if (orderType === "dine-in") {
      table = await Table.findOne({ tableNumber });

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

      if (!guestCount) {
        return res.status(400).json({
          message: "Guest count is required",
        });
      }

      if (guestCount > table.capacity) {
        return res.status(400).json({
          message: `This table can accommodate a maximum of ${table.capacity} people`,
        });
      }
    }
    // Common order validation
    if (!customerName || !phone || !items || items.length === 0) {
      return res.status(400).json({
        message: "Missing required order details",
      });
    }

    const calculatedTotal = items.reduce((total, item) => {
      const addonsTotal = (item.addons || []).reduce(
        (sum, addon) => sum + Number(addon.price || 0),
        0,
      );

      const itemTotal =
        (Number(item.price) + addonsTotal) * Number(item.quantity);

      return total + itemTotal;
    }, 0);

    const order = await Order.create({
      orderType,
      customerName,
      phone,
      tableNumber: orderType === "dine-in" ? tableNumber : null,
      guestCount: orderType === "dine-in" ? guestCount : null,
      sessionId: orderType === "dine-in" ? sessionId : null,
      items,
      totalAmount: calculatedTotal,
      paymentMethod,
    });

    // Occupy table only for dine-in orders
    if (orderType === "dine-in") {
      table.status = "occupied";
      await table.save();
    }

    // Increase ordered count for each food
    for (const item of items) {
      await Food.findByIdAndUpdate(item.foodId, {
        $inc: {
          ordered: item.quantity,
        },
      });
    }

    const io = getIO();

    // Notify kitchen/admin
    io.emit("newOrder", order);

    // Update table status only for dine-in
    if (orderType === "dine-in") {
      io.emit("tableStatusUpdated", {
        tableNumber,
        status: "occupied",
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

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

    // Send real-time update to customers
    const io = getIO();

    io.emit("orderStatusUpdated", order);

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
    if (order.orderType === "dine-in" && order.tableNumber) {
      await Table.findOneAndUpdate(
        { tableNumber: order.tableNumber },
        { status: "available" },
      );
    }
    for (const item of order.items) {
      await Food.findByIdAndUpdate(item.foodId, {
        $inc: {
          ordered: -item.quantity,
        },
      });
    }
    const io = getIO();

    io.emit("orderStatusUpdated", {
      orderId: order._id,
      status: order.status,
    });
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
export const requestOrderPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const allowedPaymentMethods = ["cash", "upi", "card"];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderType !== "parcel") {
      return res.status(400).json({
        message: "This payment flow is only for parcel orders",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be paid",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Order is already paid",
      });
    }

    order.paymentMethod = paymentMethod;
    order.paymentStatus = "pending";

    await order.save();

    const io = getIO();

    io.emit("parcelPaymentRequested", order);

    res.status(200).json({
      message: "Payment request sent successfully",
      order,
    });
  } catch (error) {
    console.error("Request parcel payment error:", error);

    res.status(500).json({
      message: "Failed to request payment",
      error: error.message,
    });
  }
};
export const getPendingParcelPayments = async (req, res) => {
  try {
    const orders = await Order.find({
      orderType: "parcel",
      paymentStatus: "pending",
    }).sort({ updatedAt: -1 });

    console.log("Pending parcel payments:", orders.length);
    console.log(
      orders.map((order) => ({
        id: order._id,
        paymentStatus: order.paymentStatus,
        orderType: order.orderType,
      })),
    );

    res.status(200).json(orders);
  } catch (error) {
    console.error("Get pending parcel payments error:", error);

    res.status(500).json({
      message: "Failed to fetch pending parcel payments",
      error: error.message,
    });
  }
};
export const confirmParcelPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderType !== "parcel") {
      return res.status(400).json({
        message: "This is not a parcel order",
      });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({
        message: "Payment is not pending for this order",
      });
    }

    order.paymentStatus = "paid";

    await order.save();

    const io = getIO();

    io.emit("parcelPaymentConfirmed", order);

    res.status(200).json({
      message: "Parcel payment confirmed successfully",
      order,
    });
  } catch (error) {
    console.error("Confirm parcel payment error:", error);

    res.status(500).json({
      message: "Failed to confirm parcel payment",
      error: error.message,
    });
  }
};
export const addItemsToParcelOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "No items provided",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.orderType !== "parcel") {
      return res.status(400).json({
        message: "Items can only be added to parcel orders",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This parcel order has already been paid",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be updated",
      });
    }

    for (const item of items) {
      if (!item.foodId || !item.name || item.price == null || !item.quantity) {
        return res.status(400).json({
          message: "Invalid order item",
        });
      }

      const addons = Array.isArray(item.addons) ? item.addons : [];

      const addonsTotal = addons.reduce(
        (total, addon) => total + Number(addon.price || 0),
        0,
      );

      const itemTotal =
        (Number(item.price) + addonsTotal) * Number(item.quantity);

      order.items.push({
        foodId: item.foodId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        addons,
        note: item.note || "",
      });

      order.totalAmount += itemTotal;
    }

    await order.save();

    const io = getIO();

    io.emit("orderUpdated", order);

    res.status(200).json({
      message: "Items added to parcel order successfully",
      order,
    });
  } catch (error) {
    console.error("Add items to parcel order error:", error);

    res.status(500).json({
      message: "Failed to add items to parcel order",
      error: error.message,
    });
  }
};
