import React, { useState, useEffect } from "react";
import axios from "axios";

const History = () => {
  const [history, setHistory] = useState([]);

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
      }
    };

    fetchHistory();
  }, []);

  return (
    <div>
      <h2>Game History</h2>
      <ul>
        {history.map((game, index) => (
          <li key={index}>
            {game.result} - {game.moves.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default History;
