import { useEffect, useState } from "react";
import API from "../services/api";

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

  if (!data) return <h3>Loading dashboard...</h3>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Dashboard</h2>

      <p>Total Subjects: {data.totalSubjects}</p>
      <p>Total Goals: {data.totalGoals}</p>
      <p>Total Tasks: {data.totalTasks}</p>
      <p>Completed Tasks: {data.completedTasks}</p>

      <h3>Overall Progress: {data.overallProgress}%</h3>
    </div>
  );
}

export default Dashboard;
