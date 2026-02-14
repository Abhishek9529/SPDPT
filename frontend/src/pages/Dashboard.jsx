import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";
import MyDay from "../components/MyDay";


function Dashboard() {
  const [data, setData] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [currentDay, setCurrentDay] = useState("");

  // Progress states (derived from tasks)
  const [academicProgress, setAcademicProgress] = useState(0);
  const [skillProgress, setSkillProgress] = useState(0);
  const [overallPDP, setOverallPDP] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);

  // Simple state: which subjects are done today { subjectId: taskId }
  const [doneSubjects, setDoneSubjects] = useState({});

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
            date: today
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

        setAcademicProgress(acProg);
        setSkillProgress(skProg);
        setOverallPDP(Math.round((acProg + skProg) / 2));
        setPendingTasks(allTasks.filter(t => !t.isCompleted));
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student) return;

    // 1. Fetch Dashboard Stats
    API.get(`/dashboard/${student._id}`)
      .then(res => setData(res.data))
      .catch(err => console.log(err));

    // 2. Fetch Today's Timetable + preload done subjects
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[new Date().getDay()];
    setCurrentDay(dayName);

    API.get(`/timetable/${student._id}/${dayName}`)
      .then(async (res) => {
        setTimetable(res.data.timetable);

        // Preload: check which subjects already have completed tasks today
        const subjects = res.data.timetable?.subjects || [];
        const done = {};
        for (const sub of subjects) {
          if (!sub || !sub._id) continue;
          try {
            const check = await API.get(`/tasks/check/${student._id}/${sub._id}/${today}`);
            if (check.data.exists && check.data.task.isCompleted) {
              done[sub._id] = check.data.task._id;
            }
          } catch { /* ignore */ }
        }
        setDoneSubjects(done);
      })
      .catch(err => {
        console.log("No timetable found for today");
        setTimetable(null);
      });

    // 4. Fetch ALL tasks → compute progress
    API.get(`/tasks/${student._id}`)
      .then(res => {
        const allTasks = res.data.tasks || [];

        const academicTasks = allTasks.filter(t => t.goalId && t.goalId.type === "academic");
        const completedAcademic = academicTasks.filter(t => t.isCompleted).length;
        const acProg = academicTasks.length > 0 ? Math.round((completedAcademic / academicTasks.length) * 100) : 0;

        const skillTasks = allTasks.filter(t => t.goalId && t.goalId.type === "skill");
        const completedSkill = skillTasks.filter(t => t.isCompleted).length;
        const skProg = skillTasks.length > 0 ? Math.round((completedSkill / skillTasks.length) * 100) : 0;

        setAcademicProgress(acProg);
        setSkillProgress(skProg);
        setOverallPDP(Math.round((acProg + skProg) / 2));
        setPendingTasks(allTasks.filter(t => !t.isCompleted));
      })
      .catch(err => console.log("Error fetching tasks:", err));
  }, []);


  if (!data) return <h3 className="loading-text">Loading dashboard...</h3>;

  return (
    <div className="dashboard-page">
      <h2>Student Dashboard</h2>

      {/* ===== Stat Cards ===== */}
      <div className="dashboard-stats">
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

      {/* ===== Progress Section (3 bars) ===== */}
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

        {/* Overall PDP Progress */}
        <div className="progress-card pdp-card">
          <h3>🎯 Overall PDP Progress</h3>
          <div className="progress-bar-track pdp-track">
            <div
              className="progress-bar-fill pdp-fill"
              style={{ width: `${overallPDP}%` }}
            ></div>
          </div>
          <p className="progress-percent pdp-color">{overallPDP}%</p>
        </div>
      </div>

      {/* ===== MyDay: Dual Pie Charts + Hour Logger ===== */}
      <MyDay />

      {/* ===== Timetable + Pending Tasks Grid ===== */}
      <div className="dashboard-content-grid">
        {/* Today's Lectures */}
        <div className="dashboard-timetable-section">
          <h3>Today's Lectures ({currentDay})</h3>
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
          <h3>📋 Pending Tasks</h3>
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
            <p className="no-schedule-text">All tasks completed! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
