import fs from "fs/promises";
import gravatar from "gravatar";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

import { ctrlWrapper } from "../decorators/index.js";

import User from "../models/User.js";

import { HttpError, mailer } from "../helpers/index.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

dotenv.config();

const { JWT_SECRET, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationCode = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });
  const verifyEmail = {
    from: "TEST <vkutsar89@mail.ru>",
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}" >Click verify email</a>`,
  };
  await mailer(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};
const verifyEmail = async (req, res) => {
  const { verificationCode } = req.params;
  console.log(verificationCode);
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(401, "email not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });
  res.json({
    message: "Email verify success",
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "email or password invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "email is not verified");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "email or password invalid");
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({ token });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const signout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.json({
    message: "Signout success",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

export default {
  signup: ctrlWrapper(signup),
  verifyEmail: ctrlWrapper(verifyEmail),
  signin: ctrlWrapper(signin),
  getCurrent: ctrlWrapper(getCurrent),
  signout: ctrlWrapper(signout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
