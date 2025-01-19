import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
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

        setUsername(userResponse.data.username); // Set the logged-in user's username
        setUsers(
          usersResponse.data.filter(
            (user) => user.username !== userResponse.data.username
          )
        );
      } catch (err) {
        console.error("Error fetching users:", err);
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
    // Clear the token from localStorage
    localStorage.removeItem("token");

    // Redirect to the login page
    navigate("/");
  };

  return (
    <div>
      {/* Welcome message */}
      <h2>Welcome, {username}!</h2>

      {/* Logout Button */}
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      <h3>Users List</h3>
      <button onClick={handleViewHistory}>View Game History</button>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <button onClick={() => handleUserClick(user.username)}>
              {user.username}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
