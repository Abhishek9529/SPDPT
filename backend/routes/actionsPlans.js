const express = require("express");
const router = express.Router();
const ActionPlan = require("../models/ActionPlan");

// CREATE ACTION PLAN
router.post("/", async (req, res) => {
  try {
    const actionPlan = new ActionPlan(req.body);
    await actionPlan.save();

    res.status(201).json({
      message: "Action Plan created successfully",
      actionPlan
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
