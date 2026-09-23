import express from "express";
import {
  createDiningSession,
  getDiningSession,
  finishDiningSession,
  getPendingPayments,
  requestPayment,
  confirmPayment,
} from "../controllers/diningSessionController.js";

const router = express.Router();

router.post("/", createDiningSession);
router.get("/:sessionId", getDiningSession);
router.get("/payments/pending", getPendingPayments);
router.patch("/:sessionId/confirm-payment", confirmPayment);
router.patch("/:sessionId/finish", finishDiningSession);
router.patch("/:sessionId/payment", requestPayment);

export default router;
