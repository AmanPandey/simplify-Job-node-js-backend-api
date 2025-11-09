import User from "../modals/userModal.js";
import bcrypt from "bcryptjs";
import { generatedToken } from "../middleware/jwt.js";
import Employers from "../modals/employersModal.js";
import mongoose from "mongoose";

//! AUTH
// register

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password length must me at least 6 characters",
      });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(409).json({ message: "User is already register" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
    });
    res.status(201).json({
      message: "User register successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// login

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(401).json({ message: "Email does not exists." });
    }
    const comparePassword = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!comparePassword) {
      return res.status(401).json({ message: "Password does not match." });
    }
    const payload = {
      id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
    };

    const token = generatedToken(payload);

    return res.status(200).json({
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
    return res.status(500).json({ message: "Server error." });
  }
};

//!verify token

export const verifyTokenController = async (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: req.loggedInUser,
  });
};

//! EMPLOYERS
// add employer

export const addEmployer = async (req, res) => {
  try {
    const employerData = req.body;
    const userId = req.loggedInUser?.id;
    if (!employerData.name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!employerData.email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!employerData.company_name) {
      return res.status(400).json({ message: "Company name is required" });
    }
    if (!employerData.company_size) {
      return res.status(400).json({ message: "Company size is required" });
    }
    if (!employerData.industry) {
      return res.status(400).json({ message: "Industry is required" });
    }
    if (!employerData.company_location) {
      return res.status(400).json({ message: "Company location is required" });
    }

    const existingEmployer = await Employers.findOne({
      email: employerData.email,
    });
    if (existingEmployer) {
      return res.status(400).json({ message: "Employer already exist." });
    }

    const newEmployer = await Employers.create({
      ...employerData,
      createdBy: userId,
    });

    res.status(201).json({
      message: "Employer created successfully",
      employer: newEmployer,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// get employer by id (single employer)

export const getEmployer = async (req, res) => {
  try {
    const id = req.query.id?.trim();
    if (!id) {
      return res.status(400).json({ message: "Employer ID is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Employer ID format." });
    }
    const employerExist = await Employers.findById(id);
    if (!employerExist) {
      return res
        .status(404)
        .json({ message: `Employer not found with ID: ${id}` });
    }
    return res
      .status(200)
      .json({
        message: "Employer  fetched successfully",
        employer: employerExist,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// get all employers

export const getAllEmployers = async (req, res) => {
  try {
    const employers = await Employers.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ message: "Employers fetched successfully", employers });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

//update employer

export const updateEmployer = async (req, res) => {
  try {
    const id = req.query.id?.trim();
    if (!id) {
      return res.status(400).json({ message: "Employer ID is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Employer ID format." });
    }

    const updates = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update data provided." });
    }

    const employerExist = await Employers.findById(id);
    if (!employerExist) {
      return res
        .status(404)
        .json({ message: `Employer not found with ID: ${id}` });
    }
    const updatedEmployer = await Employers.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatedEmployer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.status(200).json({
      message: "Employer updated successfully.",
      employer: updatedEmployer,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
