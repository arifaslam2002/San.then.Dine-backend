import express from "express";
import {
  getFoods,
  getFoodById,
  updateFoodAvailability,
  getAvailableFoods,
} from "../controllers/foodController.js";

const router = express.Router();
router.get("/", getFoods);
router.get("/available", getAvailableFoods);
router.get("/:id", getFoodById);

router.patch("/:id/availability", updateFoodAvailability);

export default router;
