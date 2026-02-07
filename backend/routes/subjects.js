const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// CREATE SUBJECT
router.post("/", async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      message: "Subject added successfully",
      subject
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
