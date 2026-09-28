// routes/auth.routes.js
import express, { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);         // New Login Route
authRouter.post("/logout", authController.logout);       // New Logout Route
authRouter.get("/get-me", authController.getMe);
authRouter.get("/refresh-token", authController.refreshToken);

export default authRouter;