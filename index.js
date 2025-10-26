import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const databaseURL = process.env.MONGODB_URI

app.use(cors({
    origin: ["https://luxury-vibes-dashboard.vercel.app","http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/", authRoutes);
app.use("/api/", dataRoutes);
const server=app.listen(PORT, () => {
  console.log(`Server is running successfully on port ${PORT}`);
});
mongoose.connect(databaseURL).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});
