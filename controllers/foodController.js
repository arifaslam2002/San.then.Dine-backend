import Food from "../models/Food.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
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
export const createFood = async (req, res) => {
  try {
    const { name, category, price, description, ingredients, addons } =
      req.body;

    if (!name || !category || !price || !description || !req.file) {
      return res.status(400).json({
        message: "Name, category, price, description and image are required",
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer);

    const food = await Food.create({
      name,
      category,
      price,
      image: uploadResult.secure_url,
      description,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      addons: addons ? JSON.parse(addons) : [],
    });

    res.status(201).json({
      message: "Food created successfully",
      food,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create food",
      error: error.message,
    });
  }
};
export const updateFood = async (req, res) => {
  try {
    const { name, category, price, description, ingredients, addons } =
      req.body;

    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    if (name) food.name = name;
    if (category) food.category = category;
    if (price) food.price = price;
    if (description) food.description = description;

    if (ingredients) {
      food.ingredients = JSON.parse(ingredients);
    }
    if (addons) {
      food.addons = JSON.parse(addons);
    }
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);

      food.image = uploadResult.secure_url;
    }

    await food.save();

    res.status(200).json({
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update food",
      error: error.message,
    });
  }
};

export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await Food.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete food",
      error: error.message,
    });
  }
};
