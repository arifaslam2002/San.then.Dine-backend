import express from "express";
import { createOrder,getOrders,updateOrderStatus,getOrderById,cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.patch("/:id/status",updateOrderStatus)
router.get("/:id",getOrderById)
router.patch("/:id/cancel", cancelOrder);
export default router;