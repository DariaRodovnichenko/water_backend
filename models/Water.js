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
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    timezoneOffset: {
      type: Number,
      required: false,
    },
  },
  { versionKey: false, timestamps: true }
);

waterSchema.post("save", handleSaveError);
waterSchema.pre("findOneAndUpdate", preUpdate);
waterSchema.post("findOneAndUpdate", handleSaveError);

export const waterAddSchema = Joi.object({
  date: Joi.date(),
  waterAmount: Joi.number().min(0).max(5000),
  timezoneOffset: Joi.number().required(),
});

export const waterUpdateSchema = Joi.object({
  date: Joi.date(),
  waterAmount: Joi.number().min(0).max(5000),
  timezoneOffset: Joi.number().required(),
});

const Water = model("waterRecord", waterSchema);

export default Water;
