import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import Employers from "../modals/employersModal.js";

//! EMPLOYERS
// ADD EMPLOYER

export const addEmployer = async (req, res) => {
  try {
    const employerData = req.body;
    const userId = req.loggedInUser?.id;

    // Required fields
    const requiredFields = [
      "name",
      "email",
      "company_name",
      "company_size",
      "industry",
      "company_location",
    ];
    for (const field of requiredFields) {
      if (!employerData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field
            .replace("_", " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} is required.`,
        });
      }
    }

    // Check duplicate email
    const existingEmployer = await Employers.findOne({
      email: employerData.email,
    });
    if (existingEmployer) {
      return res
        .status(400)
        .json({ success: false, message: "Employer already exists." });
    }

    // Create employer

    const newEmployer = await Employers.create({
      ...employerData,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Employer created successfully",
      employer: newEmployer,
    });
  } catch (error) {
    console.error(" Error adding employer:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET EMPLOYER BY ID

export const getEmployer = async (req, res) => {
  try {
    const id = req.query.id?.trim();
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employer ID is required." });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Employer ID format." });
    }
    const employerExist = await Employers.findById(id);
    if (!employerExist) {
      return res
        .status(404)
        .json({ success: false, message: `Employer not found with ID: ${id}` });
    }
    return res.status(200).json({
      success: true,
      message: "Employer  fetched successfully",
      employer: employerExist,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET ALL EMPLOYER

export const getAllEmployers = async (req, res) => {
  try {
    const employers = await Employers.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Employers fetched successfully",
      employers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// UPDATE EMPLOYER

export const updateEmployer = async (req, res) => {
  try {
    const id = req.query.id?.trim();

    // Validate ID
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employer ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Employer ID format." });
    }

    // Check if employer exists
    const employerExist = await Employers.findById(id);
    if (!employerExist) {
      return res
        .status(404)
        .json({ success: false, message: `Employer not found with ID: ${id}` });
    }

    const updates = req.body || {};

    // Safe email duplicate check
    if (updates.email && updates.email !== employerExist.email) {
      const existingEmail = await Employers.findOne({
        email: updates.email,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another employer.",
        });
      }
    }

    // Prevent empty updates
    if (!updates || Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No update data provided." });
    }

    // Update employer
    const updatedEmployer = await Employers.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedEmployer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found." });
    }

    res.status(200).json({
      success: true,
      message: "Employer updated successfully.",
      employer: updatedEmployer,
    });
  } catch (error) {
    console.error(" Error updating employer:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE EMPLOYER

export const deleteEmployer = async (req, res) => {
  try {
    const id = req.query.id?.trim();

    // Validate ID
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Employer ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Employer ID format." });
    }

    // Delete employer and get the deleted document
    const deletedEmployer = await Employers.findByIdAndDelete(id);

    if (!deletedEmployer) {
      return res
        .status(404)
        .json({ success: false, message: "Employer not found." });
    }

    res.status(200).json({
      success: true,
      message: "Employer deleted successfully.",
      employer: deletedEmployer,
    });
  } catch (error) {
    console.error(" Error deleting employer:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
