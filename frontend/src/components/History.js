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
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching game history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getResultStyle = (result) => {
    if (result.includes("won")) return "from-green-500 to-emerald-500";
    if (result.includes("lost")) return "from-red-500 to-rose-500";
    return "from-yellow-500 to-amber-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Game History
          </h2>
          <p className="mt-2 text-gray-400">Your past battles and victories</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/main")}
          className="mb-6 px-6 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 rounded-lg transition-all duration-300 hover:scale-[1.02] text-gray-300 hover:text-white"
        >
          ← Back to Games
        </button>

        {/* History List */}
        {isLoading ? (
          <div className="text-center text-gray-400">Loading history...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((game, index) => (
              <div
                key={index}
                className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Result Banner */}
                <div
                  className={`mb-4 px-4 py-2 rounded-lg bg-gradient-to-r ${getResultStyle(
                    game.result
                  )} bg-opacity-10 text-white font-medium`}
                >
                  {game.result}
                </div>

                {/* Moves History */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Moves:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {game.moves.map((move, moveIndex) => (
                      <span
                        key={moveIndex}
                        className="px-2 py-1 bg-gray-800/50 rounded-md text-sm text-gray-300"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Game Info */}
                <div className="mt-4 pt-4 border-t border-gray-700/30 text-sm text-gray-400">
                  Game #{history.length - index}
                </div>
              </div>
            ))}
          </div>
        )}

        {history.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/30 p-8">
            No games played yet. Start playing to build your history!
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
