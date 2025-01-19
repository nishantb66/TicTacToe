const User = require("../models/User");

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true, _id: { $ne: req.user.id } })
      .select("username")
      .exec();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active users" });
  }
};

exports.setActiveStatus = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: true });
    res.status(200).json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error setting active status" });
  }
};

exports.sendChallenge = async (req, res) => {
  const { opponentId } = req.body;
  try {
    // Implement logic to notify the opponent of the challenge
    res.status(200).json({ message: "Challenge sent" });
  } catch (err) {
    res.status(500).json({ message: "Error sending challenge" });
  }
};
