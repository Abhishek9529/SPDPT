const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

// CREATE GOAL
router.post("/", async (req, res) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();

    res.status(201).json({
      message: "Goal created successfully",
      goal
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
