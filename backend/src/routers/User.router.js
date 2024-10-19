import express from "express";
import { body } from "express-validator";
import { upload } from "../middleware/multer.middleware.js";
import {
  login,
  register,
  getUserProfile,
  allUsers,
  sendRequest,
  pendingRequestList,
  cancelPendingRequest,
  requestedUsers,
  acceptRequest,
  friendsList,
  deleteFriend,
  cancelRequest,
} from "../controllers/User.controller.js";

const userRouter = express.Router();
userRouter.post("/register", upload, register);
userRouter.post("/login", login);
userRouter.get("/profile", getUserProfile);
userRouter.get("/allUsers", allUsers);
userRouter.get("/sorted-users");
userRouter.route("/request/:value").get(sendRequest);
userRouter.route("/pending-request").get(pendingRequestList);
userRouter.route("/cancle-pending-request/:id").get(cancelPendingRequest);
userRouter.route("/request-users").get(requestedUsers);
userRouter.route("/accept-request/:id").get(acceptRequest);
userRouter.route("/friends-list").get(friendsList);
userRouter.route("/delete-friend/:id").delete(deleteFriend);
userRouter.route("/cancle-request/:id").get(cancelRequest);
userRouter.route("/delete-account/:id").delete(cancelRequest);

export { userRouter };
