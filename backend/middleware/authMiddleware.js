import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;
    token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select("-password");
        if (!req.user) {
           
            return res.status(401).json({ message: "Not authorized, user not found" });
        }
      
        next();
    } catch (error) {
        console.error("Error in auth middleware:", error);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};
export default protect;



