import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken, cookiesOptions } from "../utils/auth.js";

/**
 * user login controller
 */
export const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userExist.rows.length === 0) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const {
    id,
    name,
    email: userEmail,
    role,
    password_hash: existingPassword,
  } = userExist.rows[0];

  const isMatch = await bcrypt.compare(password, existingPassword);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(id);

  res.cookie("token", token, cookiesOptions);

  return res.status(200).json({ user: { id, name, email: userEmail, role } });
};

/**
 * logout controller
 */
export const logoutController = async (req, res) => {
  res.clearCookie("token", cookiesOptions);
  return res.status(200).json({ message: "Logged out successfully" });
};

/**
 * get user info controller
 */
export const getMeController = async (req, res) => {
    const id = req.id;
    
    const user = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [id]);

    if(user.rows.length === 0){
        return res.status(404).json({message: "User not found"})
    }

    return res.status(200).json({user: user.rows[0]})
}