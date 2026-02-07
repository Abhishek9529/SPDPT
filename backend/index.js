const express = require('express');
const app = express();
const port = 3000;
const connectDB = require('../backend/config/db.js');
const studentSchema = require('../backend/models/Student.js');
const subjectSchema = require('../backend/models/Subject.js');
const studentRoutes = require('../backend/routes/students.js');
const subjectRoutes = require('../backend/routes/subjects.js');
const goalSchema = require('../backend/models/Goal.js');
const goalRoutes = require('../backend/routes/goals.js');
const actionPlanSchema = require('../backend/models/ActionPlan.js');
const actionPlanRoutes = require("../backend/routes/actionsPlans.js");
const taskSchema = require('../backend/models/Task.js');
const taskRoutes = require('../backend/routes/tasks.js');
const progressSchema = require('../backend/models/Progress.js');
const progressRoutes = require('../backend/routes/progress.js');



// after this error :- {"error":"Cannot destructure property 'name' of 'req.body' as it is undefined."}
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// mongodb connnection
connectDB();


// register route
app.use('/api/students', studentRoutes);

// add subject route
app.use('/api/subjects', subjectRoutes);

// add goal route
app.use('/api/goals', goalRoutes);

// add action plan route
app.use('/api/actionPlans', actionPlanRoutes);

// add task route
app.use('/api/tasks', taskRoutes);

// progress track route
app.use('/api/progress', progressRoutes);

// root route
app.get("/", (req, res)=>{
    res.send("server sucessfully created...");
})

app.listen(port, () =>{
    console.log(`server is running on ${port}`);
})