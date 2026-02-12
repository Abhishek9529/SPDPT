import { useEffect, useState } from "react";
import API from "../services/api";
import "./Tasks.css";

function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    // Fetch tasks on mount
    useEffect(() => {
        if (!student) return;

        API.get(`/tasks/${student._id}`)
            .then(res => {
                setTasks(res.data.tasks);
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
            const res = await API.post("/tasks", {
                studentId: student._id,
                taskTitle
            });

            // Add new task to list
            setTasks([...tasks, res.data.task]);

            // Clear form
            setTaskTitle("");

            alert("Task added successfully");
        } catch (err) {
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
            setTasks(tasks.map(t =>
                t._id === task._id ? res.data.task : t
            ));
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
                            <span className={`task-title ${task.isCompleted ? "done" : ""}`}>
                                {task.taskTitle}
                            </span>
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
