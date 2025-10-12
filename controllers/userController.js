import User from "../models/userModel.js";


const userManagement = async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const addUser = async (req, res) => {
    const { name, email, password, role} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists" });
        }
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: { id: newUser._id, email: newUser.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { email } = req.params;
    if (!email) {
        return res.status(400).json({ message: "User email is required" });
    }
    try {
        const user = await User.findOneAndDelete({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
const userinfo = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error in userinfo:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const editUser = async (req, res) => {
    const { email } = req.params;
    const { name, newEmail, password, role } = req.body;

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "Usver not found" });
        }

        if (name) user.name = name;
        if (newEmail) user.email = newEmail;
        if (password) user.password = password;
        if (role !== undefined) user.role = role;

        await user.save();

        res.status(200).json({ 
            message: "User updated successfully",
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { userManagement, addUser, deleteUser, editUser, userinfo };