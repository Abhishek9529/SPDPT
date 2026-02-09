import { useEffect, useState } from "react";
import API from "../services/api";

function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [semester, setSemester] = useState("");
    const [loading, setLoading] = useState(true);

    const student = JSON.parse(localStorage.getItem("student"));

    // Fetch subjects on mount
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

    // Add new subject
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
                semester
            });

            // Add new subject to list
            setSubjects([...subjects, res.data.subject]);

            // Clear form
            setSubjectName("");
            setSemester("");

            alert("Subject added successfully");
        } catch (err) {
            alert(err.response?.data?.error || "Failed to add subject");
        }
    };

    if (loading) return <h3>Loading subjects...</h3>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Subjects</h2>

            {/* Add Subject Form */}
            <form onSubmit={handleAddSubject} style={{ marginBottom: "20px" }}>
                <input
                    placeholder="Subject Name"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Semester (optional)"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle}>Add Subject</button>
            </form>

            {/* Subjects List */}
            {subjects.length === 0 ? (
                <p>No subjects found. Add your first subject above.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {subjects.map((subject) => (
                        <li key={subject._id} style={listItemStyle}>
                            <strong>{subject.subjectName}</strong>
                            {subject.semester && <span> | Semester: {subject.semester}</span>}
                            <span> | Status: {subject.status}</span>
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
    backgroundColor: "#007bff",
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

export default Subjects;
