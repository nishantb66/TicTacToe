import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/game/history`,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        setHistory(response.data); // Games are already sorted by backend
      } catch (error) {
        console.error("Error fetching game history:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 1000); // Minimum loading time
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (gameId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/game/${gameId}`, {
        headers: { Authorization: localStorage.getItem("token") },
      });

      // Remove the deleted game from the local state
      setHistory((prevHistory) =>
        prevHistory.filter((game) => game._id !== gameId)
      );
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  const getResultStyle = (result) => {
    if (result.includes("wins")) return "text-green-600 border-green-400";
    if (result === "draw") return "text-yellow-600 border-yellow-400";
    return "text-red-600 border-red-400";
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-100 rounded-lg border border-gray-300 p-6 animate-pulse"
        >
          <div className="w-2/3 h-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="w-16 h-6 bg-gray-200 rounded-md"></div>
              ))}
            </div>
            <div className="w-1/3 h-4 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Game History
          </h2>
          <p className="mt-2 text-gray-500">Your past battles and victories</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/main")}
          className="mb-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
        >
          ← Back to Games
        </button>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((game, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Result */}
                <div
                  className={`mb-4 px-4 py-2 rounded-lg text-lg font-semibold border ${getResultStyle(
                    game.result
                  )}`}
                >
                  {game.result}
                </div>

                {/* Game Date */}
                <div className="text-sm text-gray-500 mb-2">
                  Date:{" "}
                  <span className="text-gray-800">
                    {new Date(game.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Moves */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Moves:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {game.moves.map((move, moveIndex) => (
                      <span
                        key={moveIndex}
                        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-700"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Delete Button */}
                <div className="mt-4">
                  <button
                    onClick={() => handleDelete(game._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 bg-gray-100 rounded-lg border border-gray-300 p-8">
            No games played yet. Start playing to build your history!
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
