# Tic Tac Toe Game (MERN Stack)

This is a full-stack Tic Tac Toe game application built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. The application supports both **multiplayer games** via real-time WebSocket connections and **single-player games** against an AI opponent. It includes user authentication, game history tracking, and profile management.

---

## Features

### Frontend Features:
1. **Authentication**:
   - User registration and login.
   - Token-based authentication for secure API calls.

2. **Game Modes**:
   - **Multiplayer Mode**: Real-time matches with another player in a specific game room.
   - **Single-Player Mode**: Play against an AI with adjustable difficulty.

3. **Game History**:
   - Track past games, their outcomes, and move sequences.
   - Delete individual games from the history.

4. **User Management**:
   - View online users.
   - Challenge other users to games.
   - Update profile details (username).

5. **Responsive UI**:
   - Modern, user-friendly interface built with TailwindCSS.
   - Mobile and desktop compatibility.

---

### Backend Features:
1. **Authentication**:
   - JWT-based secure authentication.
   - Middleware to protect private routes.

2. **Game Logic**:
   - Handle game moves, validate turns, and detect game results.
   - Real-time multiplayer game state synchronization using Socket.IO.
   - AI-powered moves for single-player mode (medium and hard difficulty).

3. **Database**:
   - MongoDB for storing user details and game history.
   - Models for users and games.

4. **API Endpoints**:
   - Endpoints for user actions (register, login, update profile).
   - Endpoints for game operations (save results, fetch history, delete games history).

---

## Approach and Design

### Frontend:
- **React.js**:
  - Modular and reusable components.
  - State management using React hooks (`useState`, `useEffect`).
  - Components include:
    - **GameAI.js**: Handles single-player gameplay with AI logic.
    - **GameBoard.js**: Manages real-time multiplayer matches.
    - **History.js**: Displays and manages game history.
    - **Login.js**: User login page.
    - **Register.js**: User registration page.
    - **UsersList.js**: Displays online users and provides functionality to challenge them to a game.

- **Styling**:
  - TailwindCSS for clean and responsive design.
  - Toast notifications using `react-hot-toast`.

### Backend:
- **Express.js**:
  - RESTful API endpoints for managing authentication, user data, and game logic.

- **Socket.IO**:
  - Enables real-time communication between players in multiplayer games.
  - Synchronizes game state across clients.

- **MongoDB**:
  - Stores user credentials and game history.
  - Models:
    - `User`: Handles user authentication and profile data.
    - `Game`: Tracks game results, moves, and participating players.

- **AI Logic**:
  - AI difficulty levels:
    - **Medium**: Uses heuristics to block the opponent and prioritize winning moves.
    - **Hard**: Implements a minimax algorithm for optimal decision-making.

---

## Assumptions
1. The game is turn-based, and only valid moves are processed.
2. AI difficulty levels are limited to **medium** and **hard**.
3. Users cannot play multiple games simultaneously.
4. Usernames must be unique, and passwords cannot be reused by other accounts.

---

## Instructions to Set Up and Run Locally

### Prerequisites
- Node.js and npm installed.
- MongoDB instance (local or Atlas cluster).
- MongoDB Database Tools (for backups, if needed).

---

### Steps to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>

2. **Backend Setup**:
   - Navigate to the backend folder:
     ```bash
     cd backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `backend` directory and add the following:
     ```env
     PORT=5000
     MONGO_URI=<your-mongodb-connection-uri>
     JWT_SECRET=<your-secret-key>
     ```
     Replace `<your-mongodb-connection-uri>` with your MongoDB connection string and `<your-secret-key>` with a secure string for JWT. 

   - In the `backend` directory, go to `server.js` file and replace vercel URLS with:
     ```
     http://localhost:3000
     ```     

   - Start the backend server:
     ```bash
     node server.js
     ```

3. **Frontend Setup**:
   - Navigate to the frontend folder:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `frontend` directory and add the following:
     ```env
     REACT_APP_API_URL=http://localhost:5000
     ```
     Ensure the API URL matches the backend server address.

   - Start the development server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   - Open your browser and navigate to `http://localhost:3000`.

---

## Technologies Used

- **Frontend**:
  - React.js
  - TailwindCSS
  - Axios
  - React Hot Toast
- **Backend**:
  - Node.js
  - Express.js
  - Socket.IO
  - JWT (JSON Web Tokens)
  - Mongoose (MongoDB ODM)
- **Database**:
  - MongoDB (Atlas or Local)