import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { setIO } from "./utils/socket.js";
import connectDB from "./config/db.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import tableRoutes from "./routes/tableRoutes.js";
import authRoutes from "./routes/authRoutes.js";
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});
setIO(io);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Scan.Then.Dine API is running",
  });
});

app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/auth", authRoutes);
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
