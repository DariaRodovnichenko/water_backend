import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import { ctrlWrapper } from "../decorators/index.js";

import { HttpError } from "../helpers/index.js";
import { get } from "mongoose";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password, username } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already exist");
  }

  const name = username ? username : email.split('@')[0]; 
  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({ username: name, email, password: hashPassword });

  res.status(201).json({
    username: newUser.username,
    id: newUser._id,
    email: newUser.email,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { _id, email } = req.user;

  res.json({
    id: _id,
    email,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    
    res.json({
        message: "Signout success"
    })
};

export default {
  signup: ctrlWrapper(signup),
  signin: ctrlWrapper(signin),
  signout: ctrlWrapper(signout),
  getCurrent: ctrlWrapper(getCurrent),
};
