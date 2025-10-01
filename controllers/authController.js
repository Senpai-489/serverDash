import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import mongoose from "mongoose";

export const login = async (req, res) => {
    const { email, password} = req.body;
    
    const maxAge = 3 * 24 * 60 * 60 * 1000; 
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    try {
        //  const user = await User.insertOne({ name, email, password, role });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User Doesn't exist" });
        }
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid Password" });
        }
        
        return res.status(200).json({ message: "Login Successful", user: { id: user._id, email: user.email, role:user.role, name:user.name } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}