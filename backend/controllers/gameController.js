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
// Fetch game history for the authenticated user
exports.getGameHistory = async (req, res) => {
  try {
    // Ensure `username` is available from authentication middleware
    const username = req.user.username;

    // Find games where the user is one of the players
    const games = await Game.find({ players: username })
      .select("result moves players winner createdAt")
      .sort({ createdAt: -1 }); // Sort by most recent first

    // Format each game to include opponent username
    const formattedGames = games.map((game) => {
      const opponent = game.players.find((player) => player !== username); // Identify the opponent
      return {
        ...game._doc,
        opponent, // Add opponent's username
      };
    });

    res.status(200).json(formattedGames); // Send formatted games
  } catch (err) {
    console.error("Error fetching game history:", err);
    res
      .status(500)
      .json({ message: "Error fetching game history", error: err });
  }
};

// Delete a game from history
exports.deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Find the game and ensure the authenticated user is a participant
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (!game.players.includes(req.user.username)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this game" });
    }

    // Delete the game
    await Game.findByIdAndDelete(gameId);

    res.status(200).json({ message: "Game deleted successfully" });
  } catch (err) {
    console.error("Error deleting game:", err);
    res.status(500).json({ message: "Error deleting game", error: err });
  }
};
