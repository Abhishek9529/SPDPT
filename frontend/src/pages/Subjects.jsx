import { useEffect, useState } from "react";
import API from "../services/api";
import "./Subjects.css";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [semester, setSemester] = useState("");
    const [day, setDay] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    useEffect(() => {
        if (!student) return;

        API.get(`/subjects/${student._id}`)
            .then(res => {
                setSubjects(res.data.subjects);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    const handleAddSubject = async (e) => {
        e.preventDefault();

        if (!subjectName.trim()) {
            alert("Subject name is required");
            return;
        }

        try {
            const res = await API.post("/subjects", {
                studentId: student._id,
                subjectName,
                semester,
                day
            });

            setSubjects([...subjects, res.data.subject]);
            setSubjectName("");
            setSemester("");
            setDay("");
            alert("Subject added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add subject");
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;

        try {
            await API.delete(`/subjects/${id}`);
            setSubjects(subjects.filter(s => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete subject");
        }
    };

    if (loading) return <h3 className="loading-text">Loading subjects...</h3>;

    return (
        <div className="subjects-page">
            <h2>My Subjects</h2>

            <form className="subject-form" onSubmit={handleAddSubject}>
                <input
                    placeholder="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                />
                <input
                    placeholder="Semester (optional)"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                />
                <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                >
                    <option value="">Select Day (optional)</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <button type="submit">Add Subject</button>
            </form>

            {subjects.length === 0 ? (
                <p className="empty-message">No subjects found. Add your first subject above.</p>
            ) : (
                <ul className="subject-list">
                    {subjects.map((subject) => (
                        <li key={subject._id} className="subject-item">
                            <div className="subject-info">
                                <strong>{subject.subjectName}</strong>
                                {subject.semester && <span> | Semester: {subject.semester}</span>}
                                {subject.day && <span> | Day: {subject.day}</span>}
                                <span> | Status: {subject.status}</span>
                            </div>
                            <button
                                className="delete-subject-btn"
                                onClick={() => handleDeleteSubject(subject._id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Subjects;
