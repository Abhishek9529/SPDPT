import { useEffect, useState } from "react";
import API from "../services/api";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("skill");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    // Fetch goals on mount
    useEffect(() => {
        if (!student) return;

        API.get(`/goals/${student._id}`)
            .then(res => {
                setGoals(res.data.goals);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    // Add new goal
    const handleAddGoal = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Goal title is required");
            return;
        }

        try {
            const res = await API.post("/goals", {
                studentId: student._id,
                title,
                type
            });

            // Add new goal to list
            setGoals([...goals, res.data.goal]);

            // Clear form
            setTitle("");
            setType("skill");

            alert("Goal added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add goal");
        }
    };

    if (loading) return <h3>Loading goals...</h3>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Goals</h2>

            {/* Add Goal Form */}
            <form onSubmit={handleAddGoal} style={{ marginBottom: "20px" }}>
                <input
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={inputStyle}
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={inputStyle}
                >
                    <option value="skill">Skill</option>
                    <option value="exam">Exam</option>
                    <option value="academic">Academic</option>
                </select>
                <button type="submit" style={buttonStyle}>Add Goal</button>
            </form>

            {/* Goals List */}
            {goals.length === 0 ? (
                <p>No goals found. Add your first goal above.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {goals.map((goal) => (
                        <li key={goal._id} style={listItemStyle}>
                            <strong>{goal.title}</strong>
                            <span> | Type: {goal.type}</span>
                            <span> | Status: {goal.status}</span>
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
    fontSize: "14px"
};

const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

const listItemStyle = {
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px"
};

export default Goals;
