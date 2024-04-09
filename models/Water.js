import { Schema, model } from "mongoose";
import { handleSaveError, preUpdate } from "./hooks.js";
import Joi from "joi";

const waterSchema = new Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    waterAmount: {
      type: Number,
      min: 0,
      max: 5000,
      default: 0,
      required: true,
    },
    dailyWaterRate: {
      type: Number,
      min: 0,
      max: 15000,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

waterSchema.post("save", handleSaveError);
waterSchema.pre("findOneAndUpdate", preUpdate);
waterSchema.post("findOneAndUpdate", handleSaveError);

export const updateUserWaterRateSchema = Joi.object({
  waterRate: Joi.number()
    .max(15000)
    .required()
    .messages({ "any.required": `WaterRate field is missing` }),
});

export const waterAddSchema = Joi.object({
  date: Joi.date(),
  waterAmount: Joi.number().min(0).max(5000),
  dailyWaterRate: Joi.number().min(0).max(15000),
});

export const waterUpdateSchema = Joi.object({
  date: Joi.date(),
  waterAmount: Joi.number().min(0).max(5000),
  dailyWaterRate: Joi.number().min(0).max(15000),
});

const Water = model("waterRecord", waterSchema);

export default Water;
