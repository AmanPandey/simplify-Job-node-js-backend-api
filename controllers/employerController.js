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
    const deleteUploadedFile = () => {
      if (req.file) {
        const uploadedPath = path.join(
          process.cwd(),
          "uploads",
          req.file.filename
        );
        fs.unlink(uploadedPath, (err) => {
          if (err)
            console.warn("⚠️ Failed to delete uploaded logo:", err.message);
        });
      }
    };

    // Require logo
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Company Logo is required" });
    }

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
        deleteUploadedFile();
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
      deleteUploadedFile();
      return res
        .status(400)
        .json({ success: false, message: "Employer already exists." });
    }

    // Create employer
    const logopath = `/uploads/${req.file.filename}`;
    const newEmployer = await Employers.create({
      ...employerData,
      createdBy: userId,
      company_logo: logopath,
    });

    res.status(201).json({
      success: true,
      message: "Employer created successfully",
      employer: newEmployer,
    });
  } catch (error) {
    if (req.file) {
      const uploadedPath = path.join(
        process.cwd(),
        "uploads",
        req.file.filename
      );
      fs.unlink(uploadedPath, () => {});
    }
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

    //  delete uploaded file if something fails
    const deleteUploadedFile = () => {
      if (req.file) {
        const uploadedPath = path.join(
          process.cwd(),
          "uploads",
          req.file.filename
        );
        fs.unlink(uploadedPath, (err) => {
          if (err)
            console.warn("⚠️ Failed to remove uploaded logo:", err.message);
        });
      }
    };

    // Validate ID
    if (!id) {
      deleteUploadedFile();
      return res
        .status(400)
        .json({ success: false, message: "Employer ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      deleteUploadedFile();
      return res
        .status(400)
        .json({ success: false, message: "Invalid Employer ID format." });
    }

    // Check if employer exists
    const employerExist = await Employers.findById(id);
    if (!employerExist) {
      deleteUploadedFile();
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
        deleteUploadedFile();
        return res.status(400).json({
          success: false,
          message: "Email already in use by another employer.",
        });
      }
    }

    // Handle logo update
    if (req.file) {
      const newLogoPath = `/uploads/${req.file.filename}`;
      if (employerExist.company_logo) {
        const oldLogoPath = path.join(
          process.cwd(),
          employerExist.company_logo.replace(/^\//, "")
        );
        fs.unlink(oldLogoPath, (err) => {
          if (err) console.warn("⚠️ Failed to delete old logo:", err.message);
        });
      }
      updates.company_logo = newLogoPath;
    }

    // Prevent empty updates
    if (!req.file && (!updates || Object.keys(updates).length === 0)) {
      deleteUploadedFile();
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
      deleteUploadedFile();
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
    if (req.file) {
      const uploadedPath = path.join(
        process.cwd(),
        "uploads",
        req.file.filename
      );
      fs.unlink(uploadedPath, () => {});
    }
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

    // Delete company logo if exists
    if (deletedEmployer.company_logo) {
      const logoPath = path.join(
        process.cwd(),
        deletedEmployer.company_logo.replace(/^\//, "")
      );
      fs.unlink(logoPath, (err) => {
        if (err) console.warn("⚠️ Failed to delete logo:", err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: "Employer deleted successfully.",
      employer: deletedEmployer,
    });
  } catch (error) {
    console.error("❌ Error deleting employer:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
