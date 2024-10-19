import express from "express";
import { body } from "express-validator";
import { upload } from "../middleware/multer.middleware.js";
import { deleteMessage, getMessages, sendMessage } from "../controllers/Message.controller.js";

const messageRouter = express.Router();

messageRouter.route("/send/:id").post(sendMessage);
messageRouter.route("/get/:userID").get(getMessages);
messageRouter.route("/delete/:id").delete(deleteMessage);

export { messageRouter };
