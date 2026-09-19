import express from "express";

import {
  createReview,
  getReviewsByFood,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.get("/:foodId", getReviewsByFood);

export default router;
