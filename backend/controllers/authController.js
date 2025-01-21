const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Trim spaces from username and password
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    // Check if the username already exists
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Check if the password already exists
    const existingPassword = await User.findOne({ password: trimmedPassword });
    if (existingPassword) {
      return res.status(400).json({
        message: "Try a different and unique password.",
      });
    }

    // Create a new user if both username and password are unique
    const user = new User({
      username: trimmedUsername,
      password: trimmedPassword,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Trim spaces from username and password
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    const user = await User.findOne({
      username: trimmedUsername,
      password: trimmedPassword,
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username");
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUsername = await User.findOne({ username });
    const existingPassword = await User.findOne({ password });

    if (existingUsername && existingUsername._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Username already exists." });
    }

    if (existingPassword && existingPassword._id.toString() !== req.user.id) {
      return res
        .status(400)
        .json({ message: "Set a different password; it's not unique." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, password },
      { new: true }
    );
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};
