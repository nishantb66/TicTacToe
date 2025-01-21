const Game = require("../models/Game");

/**
 * @description Save the game result
 */
exports.saveGameResult = async (req, res) => {
  try {
    const { board, result, players } = req.body;

    // Validate input data
    if (!board || !result || !players) {
      return res
        .status(400)
        .json({ message: "Board, result, and players are required" });
    }

    // Create and save the game record
    const game = new Game({
      players, // Array of player usernames
      moves: board, // Game board state
      result, // Game result: "X wins", "O wins", or "draw"
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

/**
 * @description Fetch game history for the authenticated user
 */
exports.getGameHistory = async (req, res) => {
  try {
    const username = req.user.username; // Username from authentication middleware

    // Find games where the user participated
    const games = await Game.find({ players: username })
      .select("result moves players createdAt")
      .sort({ createdAt: -1 }); // Sort by most recent first

    // Add the opponent's username for each game
    const formattedGames = games.map((game) => {
      const opponent = game.players.find((player) => player !== username);
      return {
        ...game._doc,
        opponent,
      };
    });

    res.status(200).json(formattedGames);
  } catch (err) {
    console.error("Error fetching game history:", err);
    res
      .status(500)
      .json({ message: "Error fetching game history", error: err });
  }
};

/**
 * @description Delete a game from history
 */
exports.deleteGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    // Check if the game exists and if the user is a participant
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

/**
 * @description Get AI's next move
 */
exports.getAIMove = async (req, res) => {
  const { board, difficulty } = req.body;

  // Find all empty cells on the board
  const emptyCells = board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);

  // Check if there's a winner
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

  // Find a winning move for the player
  const findWinningMove = (board, player) => {
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = player; // Simulate the move
      if (checkWinner(newBoard) === player) {
        return index;
      }
    }
    return null;
  };

  // AI logic for "medium" difficulty
  if (difficulty === "medium") {
    const aiWinningMove = findWinningMove(board, "O");
    if (aiWinningMove !== null)
      return res.status(200).json({ move: aiWinningMove });

    const opponentWinningMove = findWinningMove(board, "X");
    if (opponentWinningMove !== null)
      return res.status(200).json({ move: opponentWinningMove });

    if (emptyCells.includes(4)) return res.status(200).json({ move: 4 });

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((corner) =>
      emptyCells.includes(corner)
    );
    if (availableCorners.length > 0) {
      const cornerMove =
        availableCorners[Math.floor(Math.random() * availableCorners.length)];
      return res.status(200).json({ move: cornerMove });
    }

    const randomMove =
      emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return res.status(200).json({ move: randomMove });
  }

  // AI logic for "hard" difficulty using Minimax algorithm
  if (difficulty === "hard") {
    const minimax = (board, isMaximizing) => {
      const winner = checkWinner(board);
      if (winner === "X") return -1; // Human wins
      if (winner === "O") return 1; // AI wins
      if (!board.includes(null)) return 0; // Draw

      const scores = [];
      for (const index of emptyCells) {
        const newBoard = [...board];
        newBoard[index] = isMaximizing ? "O" : "X";
        const score = minimax(newBoard, !isMaximizing);
        scores.push(score);
      }

      return isMaximizing ? Math.max(...scores) : Math.min(...scores);
    };

    const scores = emptyCells.map((index) => {
      const newBoard = [...board];
      newBoard[index] = "O";
      return { index, score: minimax(newBoard, false) };
    });

    const bestMove = scores.reduce((best, curr) =>
      curr.score > best.score ? curr : best
    );
    return res.status(200).json({ move: bestMove.index });
  }

  // Invalid difficulty level
  return res.status(400).json({ error: "Invalid difficulty level provided." });
};
