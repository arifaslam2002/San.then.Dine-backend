import Food from "../models/Food.js";

export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch foods",
      error: error.message,
    });
  }
};
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.status(200).json(food);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch food",
      error: error.message,
    });
  }
};
export const updateFoodAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true },
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.status(200).json({
      message: "Food availability updated",
      food,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update food availability",
      error: error.message,
    });
  }
};
export const getAvailableFoods = async (req, res) => {
  try {
    const foods = await Food.find({ available: true });

    res.status(200).json(foods);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch available foods",
      error: error.message,
    });
  }
};