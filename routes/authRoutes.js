import express from "express";
import {
  registerUser,
  loginUser,
  verifyTokenController,
  addEmployer,
  getAllEmployers,
  updateEmployer,
  getEmployer,
  deleteEmployer,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/jwt.js";

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
router.post("/addEmployer", verifyToken, addEmployer);

// get employer
router.get("/getEmployer", verifyToken, getEmployer);

// get all employers
router.get("/getAllEmployers", verifyToken, getAllEmployers);

// update employer
router.put("/updateEmployer", verifyToken, updateEmployer);

// delete employer
router.post("/deleteEmployer", verifyToken, deleteEmployer);

export default router;
