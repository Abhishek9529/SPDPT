const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

router.post("/", async (req, res) => {
  try {
    const { name, email, password, branch, semester, careerGoal } = req.body;

    // check existing user
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const newStudent = new Student({
      name,
      email,
      password,
      branch,
      semester,
      careerGoal
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student registered successfully",
      student: newStudent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
