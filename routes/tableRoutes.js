import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { getTables, createTable } from "../controllers/tableController.js";

const router = express.Router();

router.get("/", getTables);

router.post("/", protect, adminOnly, createTable);

export default router;
