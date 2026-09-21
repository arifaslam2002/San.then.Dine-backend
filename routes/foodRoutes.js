import express from "express";
import protect from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import {
  getFoods,
  getFoodById,
  updateFoodAvailability,
  getAvailableFoods,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();
router.get("/", getFoods);
router.get("/available", getAvailableFoods);
router.post("/", protect, adminOnly, upload.single("image"), createFood);
router.patch("/:id", protect, adminOnly, upload.single("image"), updateFood);
router.delete("/:id", protect, adminOnly, deleteFood);
router.get("/:id", getFoodById);
router.patch("/:id/availability", protect, adminOnly, updateFoodAvailability);

export default router;
