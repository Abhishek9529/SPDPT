import { useEffect, useState } from "react";
import API from "../services/api";
import "./Goals.css";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("skill");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

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
                type,
                endDate: deadline || undefined
            });

            setGoals([...goals, res.data.goal]);
            setTitle("");
            setType("skill");
            setDeadline("");
            alert("Goal added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add goal");
        }
    };

    if (loading) return <h3 className="loading-text">Loading goals...</h3>;

    return (
        <div className="goals-page">
            <h2>My Goals</h2>

            <form className="goal-form" onSubmit={handleAddGoal}>
                <input
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="skill">Skill</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Exam</option>
                    <option value="longterm">Long Term</option>
                    <option value="midterm">Mid Term</option>
                    <option value="shortterm">Short Term</option>
                </select>
                <input
                    type="date"
                    placeholder="Deadline (Optional)"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="deadline-input"
                />
                <button type="submit">Add Goal</button>
            </form>

            {goals.length === 0 ? (
                <p className="empty-message">No goals found. Add your first goal above.</p>
            ) : (
                <ul className="goal-list">
                    {goals.map((goal) => {
                        const deadline = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : null;
                        return (
                            <li key={goal._id} className="goal-item">
                                <strong>{goal.title}</strong>
                                <span> | Type: {goal.type}</span>
                                <span> | Status: {goal.status}</span>
                                {deadline && <span className="goal-deadline"> | Deadline: {deadline}</span>}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Goals;
