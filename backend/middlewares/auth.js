import jwt from "jsonwebtoken";
import "dotenv/config";

/**
 * protect middleware that validate token 
 */
export const protectMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.id = decoded.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
