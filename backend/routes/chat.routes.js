// backend/routes/chat.routes.js
import { Router } from "express";
import * as chatController from "../controllers/chat.controller.js";

const chatRouter = Router();
chatRouter.get("/history", chatController.getChatHistory);
chatRouter.post("/message", chatController.generateNotes);
chatRouter.post("/download-pdf", chatController.downloadPdf);

export default chatRouter;
