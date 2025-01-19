const router = require("express").Router();
const {
  getActiveUsers,
  setActiveStatus,
  sendChallenge,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/active", authMiddleware, getActiveUsers);
router.post("/active", authMiddleware, setActiveStatus);
router.post("/challenge", authMiddleware, sendChallenge);

module.exports = router;
