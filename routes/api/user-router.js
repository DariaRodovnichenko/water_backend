import express from 'express';
import userController from "../../controllers/user-controller.js";
import { isEmptyBody, authenticate, upload } from '../../middlewares/index.js';

const userRouter = express.Router();

userRouter.get("/current", authenticate, userController.getCurrent);

userRouter.patch("/", authenticate, isEmptyBody, userController.updateUserInfo);

userRouter.patch("/avatars", authenticate, upload.single("avatar"), userController.updateAvatarUser);


export default userRouter;