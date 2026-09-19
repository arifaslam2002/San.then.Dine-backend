import express from "express";
import {
  getFoods,
  getFoodById,
  updateFoodAvailability,
  getAvailableFoods,
  createFood,
  updateFood,
  deleteFood
} from "../controllers/foodController.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();
router.get("/", getFoods);
router.get("/available", getAvailableFoods);
router.post("/", upload.single("image"), createFood);
router.patch("/:id", upload.single("image"), updateFood);
router.delete("/:id", deleteFood);
router.get("/:id", getFoodById);
router.patch("/:id/availability", updateFoodAvailability);

export default router;
