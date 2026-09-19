import express from "express";
import {
  getFoods,
  getFoodById,
  updateFoodAvailability,
  getAvailableFoods,
  createFood,
  updateFood,
} from "../controllers/foodController.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();
router.get("/", getFoods);
router.get("/available", getAvailableFoods);
router.post("/", upload.single("image"), createFood);
router.patch("/:id", upload.single("image"), updateFood);
router.get("/:id", getFoodById);
router.patch("/:id/availability", updateFoodAvailability);

export default router;
