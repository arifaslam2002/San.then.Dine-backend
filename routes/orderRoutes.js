import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import { staffOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.post("/", createOrder);
router.get("/", protect, staffOnly, getOrders);
router.patch("/:id/status", protect, staffOnly, updateOrderStatus);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);
export default router;
