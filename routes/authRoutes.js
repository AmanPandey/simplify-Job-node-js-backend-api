import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  verifyTokenController,
} from "../controllers/authController.js";
import {
  addEmployer,
  getAllEmployers,
  updateEmployer,
  getEmployer,
  deleteEmployer,
} from "../controllers/employerController.js";
import { verifyToken } from "../middleware/jwt.js";
import upload from "../middleware/uploadsMiddleware.js";

const router = express.Router();

//! AUTH
//register
router.post("/register", registerUser);

// login
router.post("/login", loginUser);

//! verify token
router.get("/verifyToken", verifyToken, verifyTokenController);

//! EMPLOYERS
// add employer
router.post(
  "/addEmployer",
  verifyToken,
  upload.single("company_logo"),

  addEmployer
);

// get employer
router.get("/getEmployer", verifyToken, getEmployer);

// get all employers
router.get("/getAllEmployers", verifyToken, getAllEmployers);

// update employer
router.put(
  "/updateEmployer",
  verifyToken,
  upload.single("company_logo"),

  updateEmployer
);

// delete employer
router.delete("/deleteEmployer", verifyToken, deleteEmployer);

export default router;
