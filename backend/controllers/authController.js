const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * @description Register a new user
 */
exports.register = async (req, res) => {
  const { username, password } = req.body;

  // Trim spaces from username and password to avoid leading/trailing whitespace issues
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    // Check if the username already exists in the database
    const existingUsername = await User.findOne({ username: trimmedUsername });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Check if the password already exists in the database
    const existingPassword = await User.findOne({ password: trimmedPassword });
    if (existingPassword) {
      return res
        .status(400)
        .json({ message: "Try a different and unique password." });
    }

    // Create a new user and save to the database
    const user = new User({
      username: trimmedUsername,
      password: trimmedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Server error during registration",
        error: err.message,
      });
  }
};

/**
 * @description Login a user
 */
exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Trim spaces from username and password
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  try {
    // Validate the user's credentials
    const user = await User.findOne({
      username: trimmedUsername,
      password: trimmedPassword,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error during login", error: err.message });
  }
};

/**
 * @description Get data of the authenticated user
 */
exports.getUserData = async (req, res) => {
  try {
    // Find the user by ID, excluding the password field
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @description Get a list of all users (excluding sensitive information)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Retrieve all users and only include their usernames
    const users = await User.find().select("username");
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
};

/**
 * @description Update user details
 */
exports.updateUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the new username is already taken by another user
    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername._id.toString() !== req.user.id) {
      return res.status(400).json({ message: "Username already exists." });
    }

    // Check if the new password is already used by another user
    const existingPassword = await User.findOne({ password });
    if (existingPassword && existingPassword._id.toString() !== req.user.id) {
      return res
        .status(400)
        .json({ message: "Set a different password; it's not unique." });
    }

    // Update the user's details in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { username, password },
      { new: true } // Return the updated user document
    );

    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res
      .status(500)
      .json({ message: "Error updating user", error: err.message });
  }
};
