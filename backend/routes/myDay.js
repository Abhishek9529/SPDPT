const express = require("express");
const router = express.Router();
const MyDay = require("../models/MyDay");

// POST today's data
router.post("/", async (req, res) => {
    try {
        const { studentId, categories } = req.body;

        const totalHours = categories.reduce((a, b) => a + Number(b.hours), 0);

        // Check if entry already exists for today — update instead of duplicate
        const todayStr = new Date().toISOString().split("T")[0];
        const dayStart = new Date(todayStr);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(todayStr);
        dayEnd.setHours(23, 59, 59, 999);

        let myDay = await MyDay.findOne({
            studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        if (myDay) {
            // Update existing
            myDay.categories = categories;
            myDay.totalHours = totalHours;
            await myDay.save();
        } else {
            // Create new
            myDay = await MyDay.create({
                studentId,
                date: todayStr,
                categories,
                totalHours
            });
        }

        res.json(myDay);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET today's MyDay data
router.get("/:studentId", async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split("T")[0];
        const dayStart = new Date(todayStr);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(todayStr);
        dayEnd.setHours(23, 59, 59, 999);

        const data = await MyDay.findOne({
            studentId: req.params.studentId,
            date: { $gte: dayStart, $lte: dayEnd }
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
