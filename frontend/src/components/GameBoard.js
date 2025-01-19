import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

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

  const handleCellClick = (index) => {
    if (!socket) return; // Ensure socket exists
    if (board[index] || turn !== playerSymbol) return;

    socket.emit("makeMove", { roomId, index, symbol: playerSymbol });
  };

  const handleBackToUsers = () => {
    navigate("/main"); // Navigate back to the UsersList page
  };

  return (
    <div>
      <h2>Game Room: {roomId}</h2>
      <h3>{message || `It's ${turn}'s turn`}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 100px)" }}>
        {board?.map((cell, index) => (
          <div
            key={index}
            onClick={() => handleCellClick(index)}
            style={{
              width: "100px",
              height: "100px",
              border: "1px solid black",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "24px",
              cursor: cell || turn !== playerSymbol ? "not-allowed" : "pointer",
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      <button onClick={handleBackToUsers} style={{ marginTop: "20px" }}>
        Back to Users List
      </button>
    </div>
  );
};

export default GameBoard;
