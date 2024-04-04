import bcrypt from "bcryptjs";
import fs from "fs/promises";

import User from "../models/User.js";
import { HttpError, cloudinary } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";

const getCurrent = (req, res) => {
  const { email, avatarURL, gender, waterRate, userName } = req.user;
  res.status(200).json({
    email,
    avatarURL,
    userName,
    gender,
    waterRate,
  });
};

const updateUserInfo = async (req, res) => {
  const { oldPassword, newPassword, timezoneOffset } = req.body;
  if (oldPassword) {
    if (!newPassword) throw HttpError(400, "New password not found");
    if (oldPassword === newPassword)
      throw HttpError(
        400,
        "The new password must be different from the old password"
      );
    const passwordCompare = await bcrypt.compare(
      oldPassword,
      req.user.password
    );
    if (!passwordCompare) {
      throw HttpError(401, "Old password is wrong");
    }
  }

  if (newPassword) {
    if (!oldPassword) throw HttpError(400, "Old password not found");
    delete req.body.oldPassword;
    req.body.password = await bcrypt.hash(newPassword, 10);
    delete req.body.newPassword;
  }

  const { _id } = req.user;
  const user = await User.findByIdAndUpdate(_id, {
    ...req.body,
    timezoneOffset,
  });
  const { userName = "", gender, email } = user;
  res.status(200).json({
    email,
    userName,
    gender,
  });
};

const updateAvatarUser = async (req, res) => {
  const { _id } = req.user;
  if (!req.file) {
    throw HttpError(400, "File not found");
  }
  const { path } = req.file;
  const { secure_url: avatarURL } = await cloudinary.uploader.upload(path, {
    folder: "water-tracker/avatars",
    public_id: `${_id}_avatar`,
    overwrite: true,
    transformation: { width: 250, height: 250, gravity: "faces", crop: "fill" },
  });
  await fs.unlink(path);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({
    avatarURL,
  });
};

export default {
  getCurrent: ctrlWrapper(getCurrent),
  updateAvatarUser: ctrlWrapper(updateAvatarUser),
  updateUserInfo: ctrlWrapper(updateUserInfo),
};
