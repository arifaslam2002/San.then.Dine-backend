import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { getTables, createTable,getTableByNumber } from "../controllers/tableController.js";

const router = express.Router();

router.get("/", getTables);
router.get("/:tableNumber", getTableByNumber);
router.post("/", protect, adminOnly, createTable);

export default router;
