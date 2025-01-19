import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/user`,
          { headers: { Authorization: localStorage.getItem("token") } }
        );
        const usersResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users`,
          { headers: { Authorization: localStorage.getItem("token") } }
        );

        setUsername(userResponse.data.username);
        setUsers(
          usersResponse.data.filter(
            (user) => user.username !== userResponse.data.username
          )
        );
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setTimeout(() => setIsLoading(false), 1000); // Minimum loading time
      }
    };

    fetchUsers();
  }, []);

  const LoadingSkeleton = () => (
    <>
      {/* Header Skeleton */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
        <div className="h-10 w-64 bg-gray-700/30 rounded-lg animate-pulse"></div>
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="h-8 w-48 bg-gray-700/30 rounded-lg animate-pulse"></div>
        <div className="h-10 w-40 bg-gray-700/30 rounded-lg animate-pulse"></div>
      </div>

      {/* Users Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700/30 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-700/30 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const handleUserClick = (otherUsername) => {
    const roomId = [username, otherUsername].sort().join("_");
    navigate(`/game/${roomId}`);
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    toast.success("Logged out successfully!", {
      duration: 2000,
      style: {
        background: "#1f2937",
        color: "#fff",
        border: "1px solid rgba(107, 114, 128, 0.3)",
      },
    });

    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Welcome, {username}!
              </h2>

              <button
                onClick={handleLogout}
                className="mt-4 sm:mt-0 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <h3 className="text-2xl font-semibold text-gray-100">
                Players Online
              </h3>
              <button
                onClick={handleViewHistory}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-all duration-300 hover:scale-105"
              >
                View Game History
              </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user._id} className="group relative">
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/30 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-lg font-medium">
                        {user.username}
                      </span>
                    </div>
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;
