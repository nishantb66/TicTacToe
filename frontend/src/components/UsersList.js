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
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    fetchUsers();
  }, []);

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
      duration: 1000,
      style: {
        background: "#ffffff",
        color: "#333",
        border: "1px solid #ddd",
      },
    });

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-lg shadow-md p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-md p-6">
              <h2 className="text-3xl font-semibold text-gray-800">
                Welcome, {username}!
              </h2>
              <button
                onClick={handleLogout}
                className="mt-4 sm:mt-0 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <h3 className="text-lg font-medium text-gray-600">
                Players Online
              </h3>
              <button
                onClick={handleViewHistory}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
              >
                View Game History
              </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-semibold mr-4">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-800 font-medium">
                      {user.username}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUserClick(user.username)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Challenge
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
