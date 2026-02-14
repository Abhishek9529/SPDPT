import { useEffect, useState } from "react";
import API from "../services/api";
import "./Tasks.css";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [goals, setGoals] = useState([]);
    const [selectedGoalId, setSelectedGoalId] = useState("");
    const [customGoal, setCustomGoal] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    // Fetch tasks and goals on mount
    useEffect(() => {
        if (!student) return;

        Promise.all([
            API.get(`/tasks/${student._id}`),
            API.get(`/goals/${student._id}`)
        ])
            .then(([tasksRes, goalsRes]) => {
                setTasks(tasksRes.data.tasks);
                setGoals(goalsRes.data.goals);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    // Add new task
    const handleAddTask = async (e) => {
        e.preventDefault();

        if (!taskTitle.trim()) {
            alert("Task title is required");
            return;
        }

        try {
            let finalGoalId = selectedGoalId;

            // If custom goal is entered, create it first
            if (customGoal.trim()) {
                const goalRes = await API.post("/goals", {
                    studentId: student._id,
                    title: customGoal.trim(),
                    type: "academic" // Default type for quick add
                });
                finalGoalId = goalRes.data.goal._id;

                // Update local goals list
                setGoals([...goals, goalRes.data.goal]);
            }

            const res = await API.post("/tasks", {
                studentId: student._id,
                taskTitle,
                goalId: finalGoalId || null
            });

            // Add new task to list
            // Determine the goal object for immediate display if we just used one
            const newTask = res.data.task;
            if (finalGoalId) {
                // If we linked a goal, we need to populate it manually for the frontend state
                // because the POST response might not have it populated deep enough or at all
                const linkedGoal = goals.find(g => g._id === finalGoalId) || { _id: finalGoalId, title: customGoal.trim() };
                newTask.goalId = linkedGoal;
            }

            setTasks([...tasks, newTask]);

            // Clear form
            setTaskTitle("");
            setSelectedGoalId("");
            setCustomGoal("");

            alert("Task added successfully");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to add task");
        }
    };

    // Toggle task completion
    const handleToggleComplete = async (task) => {
        try {
            const res = await API.put(`/tasks/${task._id}`, {
                isCompleted: !task.isCompleted
            });

            // Update task in list
            setTasks(tasks.map(t => {
                if (t._id === task._id) {
                    // Preserve populated goal info since PUT response might not re-populate it
                    const updated = res.data.task;
                    updated.goalId = t.goalId;
                    return updated;
                }
                return t;
            }));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update task");
        }
    };

    if (loading) return <h3 className="loading-text">Loading tasks...</h3>;

    return (
        <div className="tasks-page">
            <h2>My Tasks</h2>

            {/* Add Task Form */}
            <form className="task-form" onSubmit={handleAddTask}>
                <input
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                />

                <select
                    value={selectedGoalId}
                    onChange={(e) => {
                        setSelectedGoalId(e.target.value);
                        if (e.target.value) setCustomGoal(""); // Clear custom if selecting existing
                    }}
                    disabled={!!customGoal}
                >
                    <option value="">-- Connect to Goal (Optional) --</option>
                    {goals.map(g => (
                        <option key={g._id} value={g._id}>{g.title}</option>
                    ))}
                </select>

                <input
                    placeholder="Or New Goal Name"
                    value={customGoal}
                    onChange={(e) => {
                        setCustomGoal(e.target.value);
                        if (e.target.value) setSelectedGoalId(""); // Clear selection if typing custom
                    }}
                    disabled={!!selectedGoalId}
                    style={{ flex: "0 1 200px" }}
                />

                <button type="submit">Add Task</button>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
                <p className="empty-message">No tasks found. Add your first task above.</p>
            ) : (
                <ul className="task-list">
                    {tasks.map((task) => (
                        <li
                            key={task._id}
                            className={`task-item ${task.isCompleted ? "completed" : ""}`}
                        >
                            <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => handleToggleComplete(task)}
                            />
                            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <span className={`task-title ${task.isCompleted ? "done" : ""}`}>
                                    {task.taskTitle}
                                </span>
                                {task.goalId && (
                                    <span style={{ fontSize: "0.8rem", color: "#a78bfa", marginTop: "0.2rem" }}>
                                        Goal: {task.goalId.title || "Linked Goal"}
                                    </span>
                                )}
                            </div>
                            <span className={`task-status ${task.isCompleted ? "completed-status" : ""}`}>
                                {task.isCompleted ? "✓ Completed" : "Pending"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Tasks;
