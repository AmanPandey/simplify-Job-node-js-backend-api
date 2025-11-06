import User from "../modals/userModal.js";
import bcrypt from "bcryptjs";

// register

const registerUser = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { name, email, password } = req.body;
      if (!name) {
        return res.json({ message: "Name is required" });
      }
      if (!email) {
        return res.json({ message: "Email is required" });
      }
      if (!password) {
        return res.json({ message: "Password is required" });
      }
      if (password.length < 6) {
        return res.json({
          message: "Password length must me at least 6 characters",
        });
      }

      const existUser = await User.findOne({ email });
      if (existUser) {
        return res.json({ message: "User is already register" });
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
      res.status(501).json({ message: "Server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }
};

export default registerUser;
