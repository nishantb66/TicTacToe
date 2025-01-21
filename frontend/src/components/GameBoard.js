import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";

const GameBoard = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [playerSymbol, setPlayerSymbol] = useState("");
  const [message, setMessage] = useState("");
  const username = localStorage.getItem("username");

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    // Join the game room
    newSocket.emit("joinRoom", { roomId, username });

    // Assign player symbol
    newSocket.on("assignSymbol", (symbol) => {
      setPlayerSymbol(symbol);
      setMessage(`You are playing as ${symbol}`);
    });

    // Notify when another user joins the room
    newSocket.on("userJoined", (notification) => {
      toast(notification, {
        icon: "👋",
        style: {
          background: "#f9fafb",
          color: "#333",
          border: "1px solid #ddd",
        },
      });
    });

    // Notify the user they created the room and are the first to go
    newSocket.on("roomCreated", (message) => {
      toast(message, {
        icon: "🚀",
        style: {
          background: "#d1fae5",
          color: "#065f46",
          border: "1px solid #34d399",
        },
      });
    });

    // Notify when opponent leaves the room
    newSocket.on("opponentLeft", (notification) => {
      toast(notification, {
        icon: "🚶",
        style: {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        },
      });
    });

    // Update game board and turn
    newSocket.on("updateGame", ({ board, turn }) => {
      setBoard(board);
      setTurn(turn);
    });

    // Handle game over
    newSocket.on("gameOver", ({ message, board }) => {
      setBoard(board);
      setMessage(message);
      toast(message, {
        icon: message.includes("won") ? "🏆" : "🤝",
        style: {
          background: "#f9fafb",
          color: "#333",
          border: "1px solid #ddd",
        },
      });
    });

    // Handle room full error
    newSocket.on("roomFull", (message) => {
      setMessage(message);
    });

    // Cleanup on component unmount
    return () => {
      if (newSocket) {
        newSocket.emit("leaveRoom", { roomId, username });
        newSocket.disconnect();
      }
    };
  }, [roomId, username]);

  const getSymbolClass = (value) => {
    if (!value) return "";
    return value === "X" ? "text-blue-600" : "text-red-500";
  };

  const handleCellClick = (index) => {
    if (!socket) return; // Ensure socket exists
    if (board[index] || turn !== playerSymbol) return;

    socket.emit("makeMove", { roomId, index, symbol: playerSymbol });
  };

  const handleBackToUsers = () => {
    navigate("/main"); // Navigate back to the UsersList page
  };

  const handleCopyLink = () => {
    const gameUrl = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard
      .writeText(gameUrl)
      .then(() => {
        toast("Game link copied to clipboard!", {
          icon: "🔗",
          style: {
            background: "#e0f7fa",
            color: "#006064",
            border: "1px solid #4dd0e1",
          },
        });
      })
      .catch(() => {
        toast("Failed to copy game link.", {
          icon: "❌",
          style: {
            background: "#ffebee",
            color: "#b71c1c",
            border: "1px solid #ef5350",
          },
        });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          {/* Header Section */}
          <div className="text-center mb-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Game Room: {roomId}
            </h2>
            <div className="bg-gray-100 rounded-lg p-3 inline-block">
              <h3 className="text-lg text-gray-700">
                {message || `It's ${turn}'s turn`}
              </h3>
            </div>
            <button
              onClick={handleCopyLink}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
            >
              Copy Game Link
            </button>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {board?.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                className={`aspect-square flex items-center justify-center
                  text-4xl font-bold bg-gray-100 border border-gray-300 rounded-lg
                  cursor-pointer transition-all duration-200
                  ${
                    !cell && turn === playerSymbol
                      ? "hover:bg-gray-200 hover:scale-105"
                      : "cursor-not-allowed"
                  }
                `}
              >
                <span className={getSymbolClass(cell)}>{cell}</span>
              </div>
            ))}
          </div>

          {/* Player Info */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-gray-500">Playing as: </span>
              <span className={getSymbolClass(playerSymbol)}>
                {playerSymbol}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleBackToUsers}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                transition-all duration-200"
            >
              Back to Users List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
