import { useEffect, useState } from "react";
import API from "../services/api";

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

    if (loading) return <h3>Loading tasks...</h3>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Tasks</h2>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
                <input
                    placeholder="Task Title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Add Task</button>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
                <p>No tasks found. Add your first task above.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {tasks.map((task) => (
                        <li key={task._id} style={{
                            ...listItemStyle,
                            backgroundColor: task.isCompleted ? "#d4edda" : "#f5f5f5"
                        }}>
                            <input
                                type="checkbox"
                                checked={task.isCompleted}
                                onChange={() => handleToggleComplete(task)}
                                style={{ marginRight: "10px", cursor: "pointer" }}
                            />
                            <span style={{
                                textDecoration: task.isCompleted ? "line-through" : "none"
                            }}>
                                {task.taskTitle}
                            </span>
                            <span style={{ marginLeft: "10px", color: "#666" }}>
                                {task.isCompleted ? "✓ Completed" : "Pending"}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const inputStyle = {
    padding: "8px",
    marginRight: "10px",
    marginBottom: "10px",
    fontSize: "14px",
    width: "300px"
};

const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

const listItemStyle = {
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center"
};

export default Tasks;
