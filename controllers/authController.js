import User from "../modals/userModal.js";
import bcrypt from "bcryptjs";
import { generatedToken } from "../middleware/jwt.js";
import mongoose from "mongoose";

//! AUTH
// register

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password length must me at least 6 characters",
      });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(409)
        .json({ success: false, message: "User is already register" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });
    res.status(201).json({
      success: true,
      message: "User register successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required." });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "Email does not exists." });
    }
    const comparePassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!comparePassword) {
      return res
        .status(401)
        .json({ success: false, message: "Password does not match." });
    }
    const payload = {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
    };

    const token = generatedToken(payload);

    return res.status(200).json({
      success: true,
      message: "User login successfully",
      token: token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

//!verify token

export const verifyTokenController = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: req.loggedInUser,
  });
};
