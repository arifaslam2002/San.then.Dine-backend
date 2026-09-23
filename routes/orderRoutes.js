import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getOrderById,
  cancelOrder,
  requestOrderPayment,
  getPendingParcelPayments,
  confirmParcelPayment,
  addItemsToParcelOrder,
} from "../controllers/orderController.js";
import protect from "../middleware/authMiddleware.js";
import { staffOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.post("/", createOrder);
router.get("/", protect, staffOnly, getOrders);
router.patch("/:id/status", protect, staffOnly, updateOrderStatus);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/payment", requestOrderPayment);
router.get("/payments/pending-parcel", getPendingParcelPayments);
router.patch("/:id/add-items", addItemsToParcelOrder);
router.patch("/:id/confirm-payment", confirmParcelPayment);
export default router;
