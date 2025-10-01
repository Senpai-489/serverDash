import { Router } from "express";
import { login } from "../controllers/authController.js";
import { userManagement,addUser,deleteUser,editUser, userinfo } from "../controllers/userController.js";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.get("/userManagement", userManagement);
authRoutes.post("/addUser", addUser);
authRoutes.delete("/deleteUser/:email", deleteUser);
authRoutes.put("/editUser/:email", editUser);
authRoutes.get("/userinfo/:email", userinfo);
export default authRoutes;