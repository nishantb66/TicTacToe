const Game = require("../models/Game");


// Save the game result
// Save the game result
exports.saveGameResult = async (req, res) => {
  try {
    const { board, result, players } = req.body;

    // Ensure board, result, and players are provided
    if (!board || !result || !players) {
      return res
        .status(400)
        .json({ message: "Board, result, and players are required" });
    }

    // Create a game entry for both players
    const game = new Game({
      players, // Both players
      moves: board,
      result, // Correct result format (e.g., "X wins", "O wins", or "draw")
    });

    const savedGame = await game.save();
    res.status(201).json(savedGame);
  } catch (err) {
    console.error("Error saving game result:", err);
    res
      .status(500)
      .json({ message: "Error saving game result", error: err.message });
  }
};

// Fetch game history for the authenticated user
exports.getGameHistory = async (req, res) => {
  try {
    const games = await Game.find({ players: req.user.username }).select(
      "result moves createdAt"
    );
    res.status(200).json(games);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching game history", error: err });
  }
};

