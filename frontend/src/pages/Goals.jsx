import { useEffect, useState } from "react";
import API from "../services/api";
import "./Goals.css";

function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("skill");
    const [deadline, setDeadline] = useState("");
    const [loading, setLoading] = useState(true);

    const [editingGoalId, setEditingGoalId] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: "", type: "", status: "", endDate: "" });

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

    const handleDeleteGoal = async (id) => {
        if (!window.confirm("Are you sure you want to delete this goal?")) return;
        try {
            await API.delete(`/goals/${id}`);
            setGoals(goals.filter(goal => goal._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete goal");
        }
    };

    const handleEditClick = (goal) => {
        setEditingGoalId(goal._id);
        setEditFormData({
            title: goal.title,
            type: goal.type,
            status: goal.status,
            endDate: goal.endDate ? new Date(goal.endDate).toISOString().split('T')[0] : ""
        });
    };

    const handleUpdateGoal = async (id) => {
        try {
            const res = await API.put(`/goals/${id}`, editFormData);
            setGoals(goals.map(goal => goal._id === id ? res.data.goal : goal));
            setEditingGoalId(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update goal");
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
                        const formattedDeadline = goal.endDate ? new Date(goal.endDate).toLocaleDateString() : null;

                        if (editingGoalId === goal._id) {
                            return (
                                <li key={goal._id} className="goal-item editing-goal">
                                    <div className="goal-edit-form">
                                        <input
                                            type="text"
                                            value={editFormData.title}
                                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            className="edit-input"
                                            placeholder="Goal Title"
                                        />
                                        <select
                                            value={editFormData.type}
                                            onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                                            className="edit-select"
                                        >
                                            <option value="skill">Skill</option>
                                            <option value="academic">Academic</option>
                                            <option value="exam">Exam</option>
                                            <option value="longterm">Long Term</option>
                                            <option value="midterm">Mid Term</option>
                                            <option value="shortterm">Short Term</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="edit-input"
                                            placeholder="Status (e.g. ongoing, completed)"
                                        />
                                        <input
                                            type="date"
                                            value={editFormData.endDate}
                                            onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                                            className="edit-input deadline-input"
                                        />
                                    </div>
                                    <div className="goal-actions">
                                        <button className="save-btn" onClick={() => handleUpdateGoal(goal._id)}>Save</button>
                                        <button className="cancel-btn" onClick={() => setEditingGoalId(null)}>Cancel</button>
                                    </div>
                                </li>
                            );
                        }

                        return (
                            <li key={goal._id} className="goal-item">
                                <div className="goal-info">
                                    <strong>{goal.title}</strong>
                                    <span> | Type: {goal.type}</span>
                                    <span> | Status: {goal.status}</span>
                                    {formattedDeadline && <span className="goal-deadline"> | Deadline: {formattedDeadline}</span>}
                                </div>
                                <div className="goal-actions">
                                    <button className="edit-btn" onClick={() => handleEditClick(goal)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDeleteGoal(goal._id)}>Delete</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Goals;
