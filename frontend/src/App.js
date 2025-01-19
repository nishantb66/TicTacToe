import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import Register from "./components/Register";
import GameBoard from "./components/GameBoard";
import History from "./components/History";
import UsersList from "./components/UsersList";


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid rgba(107, 114, 128, 0.3)",
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<GameBoard />} />
          <Route path="/main" element={<UsersList />} />
          <Route path="/game/:roomId" element={<GameBoard />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;