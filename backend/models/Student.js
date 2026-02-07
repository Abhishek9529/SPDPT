const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  branch: String,
  semester: String,
  careerGoal: String,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Student', studentSchema);