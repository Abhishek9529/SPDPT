import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";
import MyDay from "../components/MyDay";
import WeeklyMyDayChart from "../components/WeeklyMyDayChart";
import TaskReminder from "../components/TaskReminder";
import GreetingBanner from "../components/GreetingBanner";
import UncompletedTasks from "../components/UncompletedTasks";
import CompletedTasks from "../components/CompletedTasks";


function Dashboard() {
  const [data, setData] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [currentDay, setCurrentDay] = useState("");
  const [studentName, setStudentName] = useState("Student");

  // Progress states (derived from tasks)
  const [academicProgress, setAcademicProgress] = useState(0);
  const [skillProgress, setSkillProgress] = useState(0);
  const [shortTermProgress, setShortTermProgress] = useState(0);
  const [midTermProgress, setMidTermProgress] = useState(0);
  const [longTermProgress, setLongTermProgress] = useState(0);

  // Task Categories
  const [pendingTasks, setPendingTasks] = useState([]); // Today's pending
  const [backlogTasks, setBacklogTasks] = useState([]); // Past uncompleted
  const [completedHistory, setCompletedHistory] = useState([]); // Past completed

  // Track tasks by goal type for modal display
  const [shortTermTasks, setShortTermTasks] = useState([]);
  const [midTermTasks, setMidTermTasks] = useState([]);
  const [longTermTasks, setLongTermTasks] = useState([]);
  const [selectedGoalType, setSelectedGoalType] = useState(null);

  // Goal names
  const [shortTermGoalName, setShortTermGoalName] = useState("Short-Term Goals");
  const [midTermGoalName, setMidTermGoalName] = useState("Mid-Term Goals");
  const [longTermGoalName, setLongTermGoalName] = useState("Long-Term Goals");

  const [showHistory, setShowHistory] = useState(false);

  // Simple state: which subjects are done today { subjectId: taskId }
  const [doneSubjects, setDoneSubjects] = useState({});
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);

  // Today as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // ---- markSubjectDone: the ONLY checkbox handler ----
  const markSubjectDone = async (subjectId, subjectName) => {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student) return;

    try {
      if (doneSubjects[subjectId]) {
        // Task EXISTS → toggle OFF (uncheck)
        await API.put(`/tasks/${doneSubjects[subjectId]}`, { isCompleted: false });
        setDoneSubjects(prev => {
          const copy = { ...prev };
          delete copy[subjectId];
          return copy;
        });
      } else {
        // Step 1: Fetch academic goal DIRECTLY (not from state)
        let goalId = null;
        try {
          const goalsRes = await API.get(`/goals/${student._id}`);
          const goals = goalsRes.data.goals || [];
          const academic = goals.find(g => g.type === "academic");
          if (academic) goalId = academic._id;
        } catch (e) {
          console.log("Could not fetch goals:", e);
        }

        // Step 2: Check if task exists for today
        const checkRes = await API.get(`/tasks/check/${student._id}/${subjectId}/${today}`);

        if (checkRes.data.exists) {
          // Task exists but was unchecked → mark completed + fix goalId if missing
          await API.put(`/tasks/${checkRes.data.task._id}`, { isCompleted: true, goalId: goalId });
          setDoneSubjects(prev => ({ ...prev, [subjectId]: checkRes.data.task._id }));
        } else {
          // No task → CREATE with goalId
          const res = await API.post("/tasks", {
            studentId: student._id,
            taskTitle: `${subjectName} Daily Study`,
            subjectId,
            goalId: goalId,
            isCompleted: true,
            date: today,
            deadline: today
          });
          setDoneSubjects(prev => ({ ...prev, [subjectId]: res.data.task._id }));
        }
      }

      // Refresh dashboard after change
      refreshDashboard(student._id);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Helper to check if a date string is strictly before today (YYYY-MM-DD comparison)
  const isPastDate = (dateStr) => {
    if (!dateStr) return false;
    const tDate = dateStr.split("T")[0];
    return tDate < today;
  };

  // Helper to check if a date string is strictly today
  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const tDate = dateStr.split("T")[0];
    return tDate === today;
  };

  // ---- Refresh stats + progress bars ----
  const refreshDashboard = (studentId) => {
    API.get(`/dashboard/${studentId}`)
      .then(res => setData(res.data))
      .catch(err => console.log(err));

    API.get(`/tasks/${studentId}`)
      .then(res => {
        const allTasks = res.data.tasks || [];

        const academicTasks = allTasks.filter(t => t.goalId && t.goalId.type === "academic");
        const completedAcademic = academicTasks.filter(t => t.isCompleted).length;
        const acProg = academicTasks.length > 0 ? Math.round((completedAcademic / academicTasks.length) * 100) : 0;

        const skillTasks = allTasks.filter(t => t.goalId && t.goalId.type === "skill");
        const completedSkill = skillTasks.filter(t => t.isCompleted).length;
        const skProg = skillTasks.length > 0 ? Math.round((completedSkill / skillTasks.length) * 100) : 0;

        // Short-term progress
        const shortTasks = allTasks.filter(t => t.goalId && t.goalId.type === "shortterm");
        const completedShort = shortTasks.filter(t => t.isCompleted).length;
        const shortProg = shortTasks.length > 0 ? Math.round((completedShort / shortTasks.length) * 100) : 0;

        // Mid-term progress
        const midTasks = allTasks.filter(t => t.goalId && t.goalId.type === "midterm");
        const completedMid = midTasks.filter(t => t.isCompleted).length;
        const midProg = midTasks.length > 0 ? Math.round((completedMid / midTasks.length) * 100) : 0;

        // Long-term progress
        const longTasks = allTasks.filter(t => t.goalId && t.goalId.type === "longterm");
        const completedLong = longTasks.filter(t => t.isCompleted).length;
        const longProg = longTasks.length > 0 ? Math.round((completedLong / longTasks.length) * 100) : 0;

        setAcademicProgress(acProg);
        setSkillProgress(skProg);
        setShortTermProgress(shortProg);
        setMidTermProgress(midProg);
        setLongTermProgress(longProg);

        setShortTermTasks(shortTasks);
        setMidTermTasks(midTasks);
        setLongTermTasks(longTasks);

        // Filter Tasks into Logic Buckets
        // 1. Today's Pending: Not completed AND (date is Today OR no date i.e. general tasks)
        // Note: General tasks without date are usually treated as "do it anytime", so maybe include them here or separate?
        // Assuming "Today" focus:
        const todaysPending = allTasks.filter(t => !t.isCompleted && (!t.date || isTodayDate(t.date)));

        // 2. Backlog: Not completed AND date is Past
        const backlog = allTasks.filter(t => !t.isCompleted && t.date && isPastDate(t.date));

        // 3. Completed History: Completed AND date is Past (or generally completed)
        // User asked for "Completed tasks component", let's put ALL completed tasks there for history reference?
        // Or just past ones. "jo us din ke subject the... unse dashboard pr mat show karna" imply removing past stuff from main view.
        // Let's put ALL completed tasks in history to keep main view clean, or just past ones.
        // Usually "Pending" vs "Completed" separation is good.
        // But user specifically said "us din ke subject... (past day subjects)... dashboard par mat show karna... completed task ke liye alag component".
        // This suggests Today's items should stay on dashboard.
        // So Today's Completed -> stay on timetable view.
        // Past Completed -> move to History component.
        const pastCompleted = allTasks.filter(t => t.isCompleted && t.date && isPastDate(t.date));

        setPendingTasks(todaysPending);
        setBacklogTasks(backlog);
        setCompletedHistory(pastCompleted);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    const syncDashboard = async () => {
      const student = JSON.parse(localStorage.getItem("student"));
      if (!student) return;

      setStudentName(student.fullName || student.name || student.firstName || "Student");

      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = days[new Date().getDay()];
      setCurrentDay(dayName);

      try {
        // 1. Fetch Goals (to identify Academic Goal)
        const goalsRes = await API.get(`/goals/${student._id}`);
        const goals = goalsRes.data.goals || [];

        // Set Goal Names
        const shortTermGoal = goals.find(g => g.type === "shortterm");
        const midTermGoal = goals.find(g => g.type === "midterm");
        const longTermGoal = goals.find(g => g.type === "longterm");

        if (shortTermGoal) setShortTermGoalName(shortTermGoal.title);
        if (midTermGoal) setMidTermGoalName(midTermGoal.title);
        if (longTermGoal) setLongTermGoalName(longTermGoal.title);

        const academicGoal = goals.find(g => g.type === "academic");

        // 2. Fetch Timetable & Sync Tasks
        let subjects = [];
        try {
          const ttRes = await API.get(`/timetable/${student._id}/${dayName}`);
          setTimetable(ttRes.data.timetable);
          subjects = ttRes.data.timetable?.subjects || [];
        } catch (e) {
          console.log("No timetable found for today");
          setTimetable(null);
        }

        // Sync: Check tasks for each subject, create if missing
        const done = {};
        for (const sub of subjects) {
          if (!sub || !sub._id) continue;

          try {
            const checkRes = await API.get(`/tasks/check/${student._id}/${sub._id}/${today}`);

            if (checkRes.data.exists) {
              // Valid existing task
              if (checkRes.data.task.isCompleted) {
                done[sub._id] = checkRes.data.task._id;
              }
            } else {
              // Task MISSING -> Auto-create as Pending
              console.log(`Auto-creating task for ${sub.subjectName}`);
              await API.post("/tasks", {
                studentId: student._id,
                taskTitle: `${sub.subjectName} Daily Study`,
                subjectId: sub._id,
                goalId: academicGoal ? academicGoal._id : null,
                isCompleted: false,
                date: today,
                deadline: today // Set deadline to today for daily tasks
              });
            }
          } catch (err) {
            console.error("Sync error for subject:", sub.subjectName, err);
          }
        }
        setDoneSubjects(done);

        // 3. Final Refresh of Stats & Tasks (will include newly created tasks)
        refreshDashboard(student._id);

      } catch (err) {
        console.error("Dashboard sync error:", err);
      }
    };

    syncDashboard();
  }, []);


  if (!data) return <h3 className="loading-text">Loading dashboard...</h3>;

  return (
    <div className="dashboard-page">
      <h2>Student Dashboard</h2>

      <GreetingBanner studentName={studentName} taskCount={pendingTasks.length} />

      {/* ===== Stat Cards ===== */}
      <div className="dashboard-stats">
        {/* <div>
          <TaskReminder />
        </div> */}
        <div className="stat-card">
          <p className="stat-label">Total Subjects</p>
          <p className="stat-value">{data.totalSubjects}</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Total Goals</p>
          <p className="stat-value">{data.totalGoals}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Tasks</p>
          <p className="stat-value">{data.totalTasks}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Completed Tasks</p>
          <p className="stat-value">{data.completedTasks}</p>
        </div>
      </div>

      {/* ===== Progress Section ===== */}
      <div className="progress-grid">
        {/* Academic Progress */}
        <div className="progress-card">
          <h3>📚 Academic Progress</h3>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill academic-fill"
              style={{ width: `${academicProgress}%` }}
            ></div>
          </div>
          <p className="progress-percent academic-color">{academicProgress}%</p>
        </div>

        {/* Skill Progress */}
        <div className="progress-card">
          <h3>🛠️ Skill Progress</h3>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill skill-fill"
              style={{ width: `${skillProgress}%` }}
            ></div>
          </div>
          <p className="progress-percent skill-color">{skillProgress}%</p>
        </div>

        {/* Short-Term Progress */}
        <div className="progress-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3>🎯 {shortTermGoalName}</h3>
            <button
              className="view-tasks-btn"
              onClick={() => setSelectedGoalType(selectedGoalType === "shortterm" ? null : "shortterm")}
              title="View tasks"
            >
              {selectedGoalType === "shortterm" ? "Hide Tasks" : "View Tasks"}
            </button>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill shortterm-fill"
              style={{ width: `${shortTermProgress}%` }}
            ></div>
          </div>
          <p className="progress-percent shortterm-color">{shortTermProgress}%</p>

          {/* Task List for Short-Term */}
          {selectedGoalType === "shortterm" && (
            <div className="goal-tasks-list">
              {shortTermTasks.length > 0 ? (
                <ul>
                  {shortTermTasks.map(task => (
                    <li key={task._id} className={task.isCompleted ? "completed-task" : "pending-task"}>
                      <span className="task-status-icon">{task.isCompleted ? "✓" : "○"}</span>
                      <span className="task-name">{task.taskTitle}</span>
                      {task.goalId && <span className="task-goal">({task.goalId.title})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-tasks">No short-term tasks yet</p>
              )}
            </div>
          )}
        </div>

        {/* Mid-Term Progress */}
        <div className="progress-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3>📈 {midTermGoalName}</h3>
            <button
              className="view-tasks-btn"
              onClick={() => setSelectedGoalType(selectedGoalType === "midterm" ? null : "midterm")}
              title="View tasks"
            >
              {selectedGoalType === "midterm" ? "Hide Tasks" : "View Tasks"}
            </button>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill midterm-fill"
              style={{ width: `${midTermProgress}%` }}
            ></div>
          </div>
          <p className="progress-percent midterm-color">{midTermProgress}%</p>

          {/* Task List for Mid-Term */}
          {selectedGoalType === "midterm" && (
            <div className="goal-tasks-list">
              {midTermTasks.length > 0 ? (
                <ul>
                  {midTermTasks.map(task => (
                    <li key={task._id} className={task.isCompleted ? "completed-task" : "pending-task"}>
                      <span className="task-status-icon">{task.isCompleted ? "✓" : "○"}</span>
                      <span className="task-name">{task.taskTitle}</span>
                      {task.goalId && <span className="task-goal">({task.goalId.title})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-tasks">No mid-term tasks yet</p>
              )}
            </div>
          )}
        </div>

        {/* Long-Term Progress */}
        <div className="progress-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h3>🚀 {longTermGoalName}</h3>
            <button
              className="view-tasks-btn"
              onClick={() => setSelectedGoalType(selectedGoalType === "longterm" ? null : "longterm")}
              title="View tasks"
            >
              {selectedGoalType === "longterm" ? "Hide Tasks" : "View Tasks"}
            </button>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill longterm-fill"
              style={{ width: `${longTermProgress}%` }}
            ></div>
          </div>
          <p className="progress-percent longterm-color">{longTermProgress}%</p>

          {/* Task List for Long-Term */}
          {selectedGoalType === "longterm" && (
            <div className="goal-tasks-list">
              {longTermTasks.length > 0 ? (
                <ul>
                  {longTermTasks.map(task => (
                    <li key={task._id} className={task.isCompleted ? "completed-task" : "pending-task"}>
                      <span className="task-status-icon">{task.isCompleted ? "✓" : "○"}</span>
                      <span className="task-name">{task.taskTitle}</span>
                      {task.goalId && <span className="task-goal">({task.goalId.title})</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-tasks">No long-term tasks yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== MyDay: Dual Pie Charts + Hour Logger ===== */}
      <MyDay onSave={() => setWeeklyRefreshKey(k => k + 1)} />

      {/* ===== Weekly Productivity Trend ===== */}
      <WeeklyMyDayChart refreshKey={weeklyRefreshKey} />

      {/* ===== Backlog Section ===== */}
      <div className="dashboard-history-section" style={{ marginBottom: "2rem" }}>
        <UncompletedTasks tasks={backlogTasks} />
      </div>

      {/* ===== Timetable + Pending Tasks Grid ===== */}
      <div className="dashboard-content-grid">
        {/* Today's Lectures */}
        <div className="dashboard-timetable-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3>Today's Lectures ({currentDay})</h3>
            <button
              className="view-tasks-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>

          {showHistory && (
            <div style={{ marginBottom: "1.5rem" }}>
              <CompletedTasks tasks={completedHistory} />
            </div>
          )}
          {timetable && timetable.subjects && timetable.subjects.length > 0 ? (
            <ul className="dashboard-timetable-list">
              {timetable.subjects.map((sub, index) => {
                if (!sub) return null;
                const isDone = !!doneSubjects[sub._id];
                return (
                  <li key={sub._id || index} className={`dt-item ${isDone ? "dt-item-done" : ""}`}>
                    <label className="homework-label">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => markSubjectDone(sub._id, sub.subjectName)}
                      />
                      <span className={`dt-subject ${isDone ? "dt-subject-done" : ""}`}>
                        {sub.subjectName}
                      </span>
                    </label>
                    {sub.semester && <span className="dt-sem">{sub.semester}</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="no-schedule-text">No classes scheduled for today.</p>
          )}
        </div>

        {/* Today's Pending Tasks */}
        <div className="dashboard-pending-section">
          <h3>📋 Today's Pending Tasks</h3>
          {pendingTasks.length > 0 ? (
            <ul className="pending-task-list">
              {pendingTasks.map(task => (
                <li key={task._id} className="pending-task-item">
                  <span className="pending-task-title">{task.taskTitle}</span>
                  {task.goalId && task.goalId.type && (
                    <span className={`goal-type-badge ${task.goalId.type}`}>
                      {task.goalId.type}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-schedule-text">All tasks for today completed! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
