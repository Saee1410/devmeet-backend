import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
//import crypto from 'crypto';
import User from '../models/user.model.js';
import Meeting from '../models/meeting.model.js';
import generateToken from '../utils/generateToken.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please Provide Email and Password" });
    }

    try {
        // ईमेल लहान लिपीत (lowercase) करून शोधणे जेणेकरून चूक होणार नाही
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Invalid password" 
            });
        }
        
        const token = generateToken(user._id);

        return res.status(httpStatus.OK).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
       

    } catch (e) {
        console.error("Login Error:", e);
        return res.status(500).json({ message: `Something went wrong: ${e.message}` });
    }
}

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const lowerCaseEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: lowerCaseEmail });
        
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email: lowerCaseEmail,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(httpStatus.CREATED).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}



export const addToHistory = async (req, res)=> {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        if(!user){
            return res.status(404).json({
                message: "User not found"
            });
        }

        const newMeeting = new Meeting({
            user_id: user._id.toString(),
            meetingCode: meeting_code
        });

        await newMeeting.save();
        return res.json({ message: "Meeting added to history successfully" });
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
} 

export const getUserHistory = async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const meetings = await Meeting.find({ 
            user_id: user._id.toString()
         });
        return res.json(meetings);
    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e.message}` });
    }
};

export default { login, register, addToHistory, getUserHistory };