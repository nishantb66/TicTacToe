const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
  {
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    moves: [{ type: String }],
    result: {
      type: String,
      enum: ["X wins", "O wins", "draw"], // Updated enum values
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
