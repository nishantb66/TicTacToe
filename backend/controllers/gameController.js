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

exports.getAIMove = async (req, res) => {
  const { board, difficulty } = req.body;

  const emptyCells = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);

  const checkWinner = (board) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const findWinningMove = (board, player) => {
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = player; // Simulate player's move
      if (checkWinner(newBoard) === player) {
        return index;
      }
    }
    return null;
  };

  if (difficulty === "medium") {
    // Heuristic Algorithm (Easy Mode)

    // Step 1: Check for AI Winning Move
    const aiWinningMove = findWinningMove(board, "O");
    if (aiWinningMove !== null) {
      return res.status(200).json({ move: aiWinningMove });
    }

    // Step 2: Block Opponent's Winning Move
    const opponentWinningMove = findWinningMove(board, "X");
    if (opponentWinningMove !== null) {
      return res.status(200).json({ move: opponentWinningMove });
    }

    // Step 3: Take the Center
    if (emptyCells.includes(4)) {
      return res.status(200).json({ move: 4 });
    }

    // Step 4: Take a Corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((corner) =>
      emptyCells.includes(corner)
    );
    if (availableCorners.length > 0) {
      const cornerMove =
        availableCorners[Math.floor(Math.random() * availableCorners.length)];
      return res.status(200).json({ move: cornerMove });
    }

    // Step 5: Random Move
    const randomMove =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return res.status(200).json({ move: randomMove });
  } else if (difficulty === "hard") {
    // Minimax Algorithm (Medium Mode)

    const minimax = (board, isMaximizing) => {
      const winner = checkWinner(board);
      if (winner === "X") return -1; // Human wins
      if (winner === "O") return 1; // AI wins
      if (!board.includes(null)) return 0; // Draw

      const scores = [];
      const emptyCells = board
        .map((cell, index) => (cell === null ? index : null))
        .filter((index) => index !== null);

      for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = isMaximizing ? "O" : "X"; // AI maximizes, Human minimizes

        const score = minimax(newBoard, !isMaximizing); // Recursive call
        scores.push(score);
      }

      return isMaximizing ? Math.max(...scores) : Math.min(...scores);
    };

    const scores = [];
    const emptyCells = board
      .map((cell, index) => (cell === null ? index : null))
      .filter((index) => index !== null);

    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = "O"; // AI plays as "O"
      scores.push({ index, score: minimax(newBoard, false) });
    }

    const bestMove = scores.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    );
    return res.status(200).json({ move: bestMove.index });
  }

  // Fallback for invalid difficulty
  return res.status(400).json({ error: "Invalid difficulty level provided." });
};
