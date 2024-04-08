import express from "express";
import waterController from "../../controllers/water-controller.js";

import {
  authenticate,
  isEmptyBody,
  isValidId,
} from "../../middlewares/index.js";

import { validateBody } from "../../decorators/index.js";

import { waterAddSchema, waterUpdateSchema } from "../../models/Water.js";

const waterRouter = express.Router();

waterRouter.use(authenticate);

waterRouter.get("/", waterController.getAllWater);
waterRouter.get("/today", waterController.getWaterByDate);
waterRouter.get("/month", waterController.getWaterByMonth);
waterRouter.get("/show/:id", isValidId, waterController.getWaterById);

waterRouter.post(
  "/add",
  isEmptyBody,
  validateBody(waterAddSchema),
  waterController.addWater
);

waterRouter.put(
  "/update/:id",
  isValidId,
  isEmptyBody,
  validateBody(waterUpdateSchema),
  waterController.updateWaterById
);

waterRouter.delete("/remove/:id", isValidId, waterController.deleteWaterById);

export default waterRouter;
