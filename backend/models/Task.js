const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Goal",
    default: null
  },

  actionPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ActionPlan",
    default: null
  },

  taskTitle: {
    type: String,
    required: true
  },

  dueDate: Date,

  isCompleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Task", taskSchema);
