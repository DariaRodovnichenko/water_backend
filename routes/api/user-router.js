import express from "express";
import userController from "../../controllers/user-controller.js";
import { isEmptyBody, authenticate, upload } from "../../middlewares/index.js";
import validateBody from "../../decorators/validaterBody.js";
import { updateUserWaterRateSchema } from "../../models/Water.js";
import waterController from "../../controllers/water-controller.js";

const userRouter = express.Router();

userRouter.get("/current", authenticate, userController.getCurrent);

userRouter.patch("/", authenticate, isEmptyBody, userController.updateUserInfo);

userRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  userController.updateAvatarUser
);

userRouter.patch(
  "/waterrate",
  authenticate,
  isEmptyBody,
  validateBody(updateUserWaterRateSchema),
  waterController.waterRate
);

export default userRouter;
