import dotenv from "dotenv";
import mongoose from "mongoose";
import Food from "../models/Food.js";

dotenv.config();

const foods = [
  {
    name: "Chicken Alfaham",
    category: "Grills",
    price: 280,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950",
    description:
      "Juicy grilled chicken marinated with aromatic spices, garlic, and lemon.",
    ingredients: ["Chicken", "Spices", "Garlic", "Lemon"],
    rating: 4.8,
    reviews: 42,
    ordered: 156,
  },

  {
    name: "Chicken Burger",
    category: "Burgers",
    price: 220,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    description:
      "Crispy chicken patty layered with fresh vegetables, cheese, and our special sauce.",
    ingredients: [
      "Chicken",
      "Wheat",
      "Egg",
      "Milk",
      "Cheese",
      "Lettuce",
    ],
    rating: 4.7,
    reviews: 86,
    ordered: 243,
  },

  {
    name: "Chicken Fried Rice",
    category: "Rice",
    price: 190,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b",
    description:
      "Fragrant fried rice tossed with tender chicken, egg, vegetables, and soy.",
    ingredients: [
      "Rice",
      "Chicken",
      "Egg",
      "Soy",
      "Vegetables",
    ],
    rating: 4.6,
    reviews: 64,
    ordered: 198,
  },

  {
    name: "Tandoori Chicken",
    category: "Grills",
    price: 320,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
    description:
      "Tender chicken marinated in yogurt and spices, then grilled to perfection.",
    ingredients: [
      "Chicken",
      "Yogurt",
      "Spices",
      "Lemon",
    ],
    rating: 4.9,
    reviews: 108,
    ordered: 287,
  },

  {
    name: "Paneer Butter Masala",
    category: "Curries",
    price: 240,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7",
    description:
      "Soft paneer cooked in a rich, creamy tomato and butter-based gravy.",
    ingredients: [
      "Paneer",
      "Milk",
      "Butter",
      "Tomato",
      "Cashew",
    ],
    rating: 4.7,
    reviews: 51,
    ordered: 132,
  },

  {
    name: "Chocolate Milkshake",
    category: "Drinks",
    price: 150,
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699",
    description:
      "Creamy chocolate milkshake topped with a rich chocolate finish.",
    ingredients: [
      "Milk",
      "Chocolate",
      "Sugar",
    ],
    rating: 4.8,
    reviews: 73,
    ordered: 221,
  },
];

const seedFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Food.deleteMany();

    await Food.insertMany(foods);

    console.log("Foods seeded successfully");

    await mongoose.connection.close();
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedFoods();