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
          background: "#1f2937",
          color: "#fff",
          border: "1px solid rgba(107, 114, 128, 0.3)",
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
      return value === "X"
        ? "bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
        : "bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent";
    };

  const handleCellClick = (index) => {
    if (!socket) return; // Ensure socket exists
    if (board[index] || turn !== playerSymbol) return;

    socket.emit("makeMove", { roomId, index, symbol: playerSymbol });
  };

  const handleBackToUsers = () => {
    navigate("/main"); // Navigate back to the UsersList page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-8">
          {/* Header Section */}
          <div className="text-center mb-8 space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Game Room: {roomId}
            </h2>
            <div className="bg-gray-800/50 rounded-lg p-3 inline-block">
              <h3 className="text-xl text-gray-200">
                {message || `It's ${turn}'s turn`}
              </h3>
            </div>
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {board?.map((cell, index) => (
              <div
                key={index}
                onClick={() => handleCellClick(index)}
                className={`
                  aspect-square flex items-center justify-center
                  text-5xl md:text-6xl font-bold
                  bg-gray-800/30 border border-gray-700/30
                  rounded-lg cursor-pointer
                  transition-all duration-300
                  ${
                    !cell && turn === playerSymbol
                      ? "hover:bg-gray-700/30 hover:scale-[1.02]"
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
            <div className="inline-block bg-gray-800/50 rounded-lg px-4 py-2">
              <span className="text-gray-400">Playing as: </span>
              <span className={getSymbolClass(playerSymbol)}>
                {playerSymbol}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleBackToUsers}
              className="px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 
                border border-gray-700/30 rounded-lg
                transition-all duration-300 hover:scale-[1.02]
                text-gray-300 hover:text-white"
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
