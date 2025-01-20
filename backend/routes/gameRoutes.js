const express = require("express");
const {
  saveGameResult,
  getGameHistory,
  deleteGame,
} = require("../controllers/gameController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/result", authMiddleware, saveGameResult); // Save game results
router.get("/history", authMiddleware, getGameHistory); // Fetch game history
router.delete("/:gameId", authMiddleware, deleteGame); // Delete a game

module.exports = router;
