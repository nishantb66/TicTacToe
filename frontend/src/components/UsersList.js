import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
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
        setPassword(userResponse.data.password);
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

  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/auth/update`,
        { username, password },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      toast.success(response.data.message, { duration: 2000 });

      // Close modals after successful update
      setIsProfileOpen(false);
      setIsConfirmationOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error updating user");
    }
  };

  const handleViewHistory = () => {
    navigate("/history");
  };

  const handleUserClick = (otherUsername) => {
    const roomId = [username, otherUsername].sort().join("_");
    navigate(`/game/${roomId}`);
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-md p-6">
              <h2 className="text-3xl font-semibold text-gray-800">
                Welcome, {username}!
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                >
                  Logout
                </button>
              </div>
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

            {/* Profile Modal */}
            {isProfileOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Your Profile</h3>
                  <div className="mb-4">
                    <label className="block text-gray-600 mb-2">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="mb-4"></div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false); // Close the profile modal
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setIsConfirmationOpen(true); // Open the confirmation modal// Refresh the page
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Dialog */}
            {isConfirmationOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-4">Confirm Update</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to update your profile?
                  </p>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setIsConfirmationOpen(false); // Close the confirmation modal
                        window.location.reload(); // Refresh the page
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                      No
                    </button>
                    <button
                      onClick={() => {
                        handleUpdate(); // Execute the update functionality
                        window.location.reload(); // Refresh the page after the update
                      }}
                      href="/main"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;
