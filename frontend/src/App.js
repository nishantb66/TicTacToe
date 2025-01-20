import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import GameBoard from "./components/GameBoard";
import History from "./components/History";
import UsersList from "./components/UsersList";
import GameAI from "./components/GameAI";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<GameBoard />} />
        <Route path="/main" element={<UsersList />} /> {/* User list page */}
        <Route path="/game/:roomId" element={<GameBoard />} />
        <Route path="/history" element={<History />} />
        <Route path="/game-ai" element={<GameAI />} />
      </Routes>
    </Router>
  );
}

export default App;
