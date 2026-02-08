const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");
const Goal = require("../models/Goal");
const Task = require("../models/Task");

// DASHBOARD SUMMARY
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const totalSubjects = await Subject.countDocuments({ studentId });
    const totalGoals = await Goal.countDocuments({ studentId });
    const totalTasks = await Task.countDocuments({ studentId });
    const completedTasks = await Task.countDocuments({
      studentId,
      isCompleted: true
    });

    let overallProgress = 0;
    if (totalTasks > 0) {
      overallProgress = Math.round((completedTasks / totalTasks) * 100);
    }

    res.status(200).json({
      studentId,
      totalSubjects,
      totalGoals,
      totalTasks,
      completedTasks,
      overallProgress
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
