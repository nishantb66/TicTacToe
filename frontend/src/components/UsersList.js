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
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50">
                <div
                  className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-md md:max-w-lg 
                           transform transition-all duration-300 ease-in-out
                           mx-auto overflow-y-auto max-h-[90vh]"
                >
                  <div className="p-4 sm:p-6 md:p-8">
                    <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
                      Your Profile
                    </h3>

                    <div className="mb-4">
                      <label className="block text-gray-600 text-sm sm:text-base mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 sm:py-3
                                 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition duration-200"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
                      <button
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3 
                                 bg-gray-100 hover:bg-gray-200 
                                 rounded-lg text-gray-700 font-medium
                                 transition duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setIsConfirmationOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3
                                 bg-blue-600 hover:bg-blue-700 text-white 
                                 rounded-lg font-medium
                                 transition duration-200"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Confirmation Dialog */}
            {isConfirmationOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50">
                <div
                  className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-md 
                            transform transition-all duration-300 ease-in-out"
                >
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900">
                      Confirm Update
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6">
                      Are you sure you want to update your profile?
                    </p>
                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                      <button
                        onClick={() => {
                          setIsConfirmationOpen(false);
                          window.location.reload();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3 
                                bg-gray-100 hover:bg-gray-200 
                                rounded-lg text-gray-700 font-medium
                                transition duration-200"
                      >
                        No
                      </button>
                      <button
                        onClick={() => {
                          handleUpdate();
                          window.location.reload();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3
                                bg-blue-600 hover:bg-blue-700 text-white 
                                rounded-lg font-medium
                                transition duration-200"
                      >
                        Yes
                      </button>
                    </div>
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
