// backend/src/app.js
import express from "express";
import authRoutes from "../routes/auth.routes.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors"; // 1. Import cors
import chatRoutes from "../routes/chat.routes.js";

const app = express();

// 2. Configure CORS middleware (must be before routes)
app.use(cors({
    origin: "http://localhost:5173", // Replace with your exact Vite frontend URL
    credentials: true, // Crucial for accepting and setting cookies
}));

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);

export default app;
