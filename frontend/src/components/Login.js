import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { username, password }
      );
      localStorage.setItem("token", response.data.token);

      // Show success toast and navigate after delay
      toast.success("Login successful!", {
        duration: 2000,
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid rgba(107, 114, 128, 0.3)",
        },
      });

      setTimeout(() => {
        navigate("/main");
      }, 2000);
    } catch (err) {
      toast.error("Invalid credentials. Please try again.", {
        style: {
          background: "#1f2937",
          color: "#fff",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        },
      });
    }
  };

  // ...existing imports and state management code...

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: "#1f2937",
              color: "#fff",
            },
          }}
        />

        {/* Login Card */}
        <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/30 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-400">Sign in to continue playing</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all duration-300 placeholder:text-gray-500 text-white"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all duration-300 placeholder:text-gray-500 text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-all duration-300 hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-gray-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-500 hover:text-purple-400 transition-colors duration-300"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
