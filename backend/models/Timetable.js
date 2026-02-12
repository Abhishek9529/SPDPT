const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    day: {
        type: String,
        required: true
    },

    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Timetable", timetableSchema);
