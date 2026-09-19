import Review from "../models/Review.js";
import Food from "../models/Food.js";
export const createReview = async (req, res) => {
  try {
    const {
      foodId,
      userName,
      rating,
      comment,
    } = req.body;

    if (!foodId || !userName || !rating || !comment) {
      return res.status(400).json({
        message: "All review fields are required",
      });
    }

    const review = await Review.create({
      foodId,
      userName,
      rating,
      comment,
    });

    const reviews = await Review.find({ foodId });

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      totalRating / reviews.length;

    await Food.findByIdAndUpdate(
      foodId,
      {
        rating: Number(averageRating.toFixed(1)),
        reviews: reviews.length,
      }
    );

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
  }
};

export const getReviewsByFood = async (req, res) => {
  try {
    const reviews = await Review.find({
      foodId: req.params.foodId,
    }).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};
