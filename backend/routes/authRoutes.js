const router = require("express").Router();
const {
  register,
  login,
  getUserData,
  getAllUsers,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/user", authMiddleware, getUserData); // New route to fetch user data
router.get("/users", authMiddleware, getAllUsers);

module.exports = router;
