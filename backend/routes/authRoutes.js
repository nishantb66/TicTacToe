const router = require("express").Router();
const {
  register,
  login,
  getUserData,
  getAllUsers,
  updateUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/user", authMiddleware, getUserData); // New route to fetch user data
router.get("/users", authMiddleware, getAllUsers);
router.put("/update", authMiddleware, updateUser); // Add route for updating user

module.exports = router;
