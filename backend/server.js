const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const Game = require("./models/Game");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://tic-tac-toe-ivory-beta.vercel.app",
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: "https://tic-tac-toe-ivory-beta.vercel.app", // Allow requests from this frontend
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // If you use cookies or authentication
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error(err));

// Active games state
let activeGames = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);

    if (!activeGames[roomId]) {
      // Create a new room with the host
      activeGames[roomId] = {
        host: socket.id,
        players: [{ socketId: socket.id, username }],
        turn: "X",
        board: Array(9).fill(null),
      };
      io.to(socket.id).emit("assignSymbol", "X");
      io.to(socket.id).emit(
        "roomCreated",
        "You have created the room, so you are the first to go!"
      );
    } else if (activeGames[roomId].players.length < 2) {
      // Add the opponent to the room
      activeGames[roomId].players.push({ socketId: socket.id, username });
      io.to(socket.id).emit("assignSymbol", "O");
      io.to(roomId).emit("gameStart", "Game is ready. Let the match begin!");

      // Send the current game state to the newly joined opponent
      io.to(socket.id).emit("updateGame", {
        board: activeGames[roomId].board,
        turn: activeGames[roomId].turn,
      });
    } else {
      io.to(socket.id).emit("roomFull", "Room is full!");
    }

    // Notify other users in the room about the new player
    socket.to(roomId).emit("userJoined", `Your opponent has joined the room.`);
  });

  socket.on("makeMove", ({ roomId, index, symbol }) => {
    const game = activeGames[roomId];
    if (!game || game.board[index] || game.turn !== symbol) return;

    game.board[index] = symbol;
    game.turn = symbol === "X" ? "O" : "X";

    io.to(roomId).emit("updateGame", {
      board: game.board,
      turn: game.turn,
    });

    const winner = checkWinner(game.board);
    if (winner) {
      const result = `${winner} wins`;
      io.to(roomId).emit("gameOver", { message: result, board: game.board });

      saveGameResult(roomId, game.board, result, game.players);
      delete activeGames[roomId];
    } else if (!game.board.includes(null)) {
      const result = "draw";
      io.to(roomId).emit("gameOver", {
        message: "It's a draw!",
        board: game.board,
      });

      saveGameResult(roomId, game.board, result, game.players);
      delete activeGames[roomId];
    }
  });

  socket.on("disconnect", () => {
    for (const roomId in activeGames) {
      const game = activeGames[roomId];
      const leavingPlayerIndex = game.players.findIndex(
        (player) => player.socketId === socket.id
      );

      if (leavingPlayerIndex > -1) {
        const leavingPlayer = game.players[leavingPlayerIndex];
        const isHost = socket.id === game.host;

        if (isHost) {
          // If the host leaves, end the game and delete the room
          io.to(roomId).emit(
            "opponentLeft",
            "The host has left the game. Room is closed."
          );
          delete activeGames[roomId];
        } else {
          // If the opponent leaves, notify the host but keep the room active
          game.players.splice(leavingPlayerIndex, 1); // Remove the opponent
          io.to(game.host).emit(
            "opponentLeft",
            "Your opponent left the room. Waiting for the opponent."
          );
        }
        break;
      }
    }
  });
});

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
  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const saveGameResult = async (roomId, board, result, players) => {
  try {
    const game = new Game({
      players: players.map((player) => player.username),
      moves: board,
      result,
    });

    await game.save();
    console.log(`Game result saved for room ${roomId}`);
  } catch (err) {
    console.error("Error saving game result:", err);
  }
};
