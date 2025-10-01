import {genSalt, hash} from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: {
    type: Number,
    default: 0
  }
});

userSchema.pre("save", async function (next) {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
});

const User = mongoose.model("Users", userSchema);
export default User;
