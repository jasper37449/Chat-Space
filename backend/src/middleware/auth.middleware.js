// Protect Routes
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// In the index.js line : "route.put("/profile", protectRoute, updateProfile);"
// This middleware will verify the JWT token and allow access to protected routes (next)
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        req.user = user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.log("Error in protectRoute:", error.message);
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}