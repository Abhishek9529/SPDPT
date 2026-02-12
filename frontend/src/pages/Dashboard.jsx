import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const student = JSON.parse(localStorage.getItem("student"));

    if (!student) return;

    API.get(`/dashboard/${student._id}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  if (!data) return <h3 className="loading-text">Loading dashboard...</h3>;

  return (
    <div className="dashboard-page">
      <h2>Student Dashboard</h2>

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

      <div className="dashboard-progress">
        <h3>Overall Progress</h3>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${data.overallProgress}%` }}
          ></div>
        </div>
        <p className="progress-percent">{data.overallProgress}%</p>
      </div>
    </div>
  );
}

export default Dashboard;
