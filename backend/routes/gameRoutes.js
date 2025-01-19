const express = require("express");
const {
  saveGameResult,
  getGameHistory,
} = require("../controllers/gameController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/result", authMiddleware, saveGameResult); // Save game results
router.get("/history", authMiddleware, getGameHistory); // Fetch game history



module.exports = router;
