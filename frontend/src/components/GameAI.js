import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const GameAI = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [message, setMessage] = useState("Your turn");
  const [difficulty, setDifficulty] = useState("easy"); // easy or medium
  const [gameOver, setGameOver] = useState(false);

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

  const handleCellClick = async (index) => {
    if (board[index] || gameOver || turn !== "X") return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameOver(true);
      setMessage(`${winner} wins!`);
      toast.success(`${winner} wins!`);
      return;
    } else if (!newBoard.includes(null)) {
      setGameOver(true);
      setMessage("It's a draw!");
      toast("It's a draw!");
      return;
    }

    setTurn("O");
    setMessage("AI's turn");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/game/ai-move`,
        { board: newBoard, difficulty }
      );
      const aiMove = response.data.move;
      if (aiMove !== null) {
        newBoard[aiMove] = "O";
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner) {
          setGameOver(true);
          setMessage(`${winner} wins!`);
          toast.error(`${winner} wins!`);
          return;
        } else if (!newBoard.includes(null)) {
          setGameOver(true);
          setMessage("It's a draw!");
          toast("It's a draw!");
          return;
        }
      }
    } catch (err) {
      console.error("Error getting AI move:", err);
      toast.error("Error: Could not process AI move.");
    }

    setTurn("X");
    setMessage("Your turn");
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    setMessage("Your turn");
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />

      <div className="w-full max-w-4xl">
        {/* Difficulty Selector */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Play with AI</h2>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 text-gray-700"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {board.map((cell, index) => (
            <div
              key={index}
              onClick={() => handleCellClick(index)}
              className={`aspect-square flex items-center justify-center
                text-4xl font-bold bg-gray-100 border border-gray-300 rounded-lg
                cursor-pointer transition-all duration-200 ${
                  !cell && !gameOver && turn === "X"
                    ? "hover:bg-gray-200 hover:scale-105"
                    : "cursor-not-allowed"
                }`}
            >
              <span
                className={
                  cell === "X"
                    ? "text-blue-600"
                    : cell === "O"
                    ? "text-red-500"
                    : ""
                }
              >
                {cell}
              </span>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-700">{message}</p>
        </div>

        {/* Restart Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleRestart}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
          >
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameAI;
