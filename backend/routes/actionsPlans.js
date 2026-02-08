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

// UPDATE ACTION PLAN
// Endpoint: PUT /api/actionplans/:id
// Updates action plan details by its ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid action plan ID format"
      });
    }

    const updatedActionPlan = await ActionPlan.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedActionPlan) {
      return res.status(404).json({
        error: "Action plan not found"
      });
    }

    res.status(200).json({
      message: "Action plan updated successfully",
      actionPlan: updatedActionPlan
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ACTION PLAN
// Endpoint: DELETE /api/actionplans/:id
// Permanently removes an action plan from the database
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: "Invalid action plan ID format"
      });
    }

    const deletedActionPlan = await ActionPlan.findByIdAndDelete(id);

    if (!deletedActionPlan) {
      return res.status(404).json({
        error: "Action plan not found"
      });
    }

    res.status(200).json({
      message: "Action plan deleted successfully",
      actionPlan: deletedActionPlan
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
