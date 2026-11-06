import User from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Token is required"
            });
        }

        const user = await User.findOne({ token });

        if (!user){
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        req.user = user;

        next();

    } catch (error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export default authMiddleware;