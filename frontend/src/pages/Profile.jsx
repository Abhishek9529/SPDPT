import { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

function Profile() {
    // ===== Form state =====
    const [form, setForm] = useState({
        name: "",
        email: "",
        branch: "",
        semester: "",
        collegeName: "",
        enrollmentNumber: "",
        // Academic
        lastSemSGPA: 0,
        MSC1: 0,
        MSC2: 0,
        lastYearResult: "",
        attendance: 0,
        backlogs: 0,
        // Career
        careerGoal: "",
        technicalSkills: [],
        softSkills: [],
        certifications: "",
        projects: "",
        linkedin: "",
        github: "",
        // Personal
        achievements: "",
        hobbies: "",
    });

    // Performance (read-only)
    const [performance, setPerformance] = useState({
        academicProgress: 0,
        skillProgress: 0,
        productivityScore: 0,
        taskStreak: 0,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Temp inputs for tag-style skill entry
    const [techInput, setTechInput] = useState("");
    const [softInput, setSoftInput] = useState("");

    // ===== Fetch student data on mount =====
    useEffect(() => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        API.get(`/students/${student._id}`)
            .then((res) => {
                const s = res.data.student;
                setForm({
                    name: s.name || "",
                    email: s.email || "",
                    branch: s.branch || "",
                    semester: s.semester || "",
                    collegeName: s.collegeName || "",
                    enrollmentNumber: s.enrollmentNumber || "",
                    lastSemSGPA: s.lastSemSGPA || 0,
                    MSC1: s.MSC1 || 0,
                    MSC2: s.MSC2 || 0,
                    lastYearResult: s.lastYearResult || "",
                    attendance: s.attendance || 0,
                    backlogs: s.backlogs || 0,
                    careerGoal: s.careerGoal || "",
                    technicalSkills: s.technicalSkills || [],
                    softSkills: s.softSkills || [],
                    certifications: s.certifications || "",
                    projects: s.projects || "",
                    linkedin: s.linkedin || "",
                    github: s.github || "",
                    achievements: s.achievements || "",
                    hobbies: s.hobbies || "",
                });
                setPerformance({
                    academicProgress: s.academicProgress || 0,
                    skillProgress: s.skillProgress || 0,
                    productivityScore: s.productivityScore || 0,
                    taskStreak: s.taskStreak || 0,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching profile:", err);
                setErrorMsg("Failed to load profile data.");
                setLoading(false);
            });
    }, []);

    // ===== Generic input handler =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    // ===== Skill tag helpers =====
    const addSkill = (field, inputValue, setInputValue) => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        if (form[field].includes(trimmed)) return; // no duplicates
        setForm((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
        setInputValue("");
    };

    const removeSkill = (field, index) => {
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    // ===== Save profile =====
    const handleSave = async () => {
        const student = JSON.parse(localStorage.getItem("student"));
        if (!student) return;

        // --- Client-side validation ---
        const trimmedName = (form.name || "").trim();
        if (!trimmedName) {
            setErrorMsg("Name is required.");
            return;
        }
        if (/^\d+$/.test(trimmedName)) {
            setErrorMsg("Name cannot be only numbers. Please enter your real name.");
            return;
        }
        if (trimmedName.length < 2) {
            setErrorMsg("Name must be at least 2 characters.");
            return;
        }

        setSaving(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            // Exclude email from update (it's read-only & has unique constraint)
            const { email, ...updateData } = form;
            updateData.name = trimmedName; // use the trimmed name
            const res = await API.put(`/students/${student._id}`, updateData);
            setSuccessMsg("Profile updated successfully!");

            // Update localStorage with latest student data
            const updated = res.data.student;
            localStorage.setItem("student", JSON.stringify(updated));

            // Auto-hide success message
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            console.error("Error saving profile:", err?.response?.data || err);
            const msg = err?.response?.data?.error || "Failed to save profile. Please try again.";
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(""), 4000);
        } finally {
            setSaving(false);
        }
    };

    // ===== Loading =====
    if (loading) return <h3 className="profile-loading">Loading profile...</h3>;

    return (
        <div className="profile-page">
            <h2>My Profile</h2>

            {successMsg && <div className="profile-success">{successMsg}</div>}
            {errorMsg && <div className="profile-error">{errorMsg}</div>}

            {/* ========== 1. Basic Info ========== */}
            <div className="profile-section">
                <h3>👤 Basic Information</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Name</label>
                        <input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Email</label>
                        <input name="email" value={form.email} readOnly />
                    </div>
                    <div className="profile-field">
                        <label>Branch</label>
                        <input name="branch" value={form.branch} onChange={handleChange} />
                    </div>
                    <div className="profile-field">
                        <label>Semester</label>
                        <input
                            name="semester"
                            value={form.semester}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>College Name</label>
                        <input
                            name="collegeName"
                            value={form.collegeName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Enrollment Number</label>
                        <input
                            name="enrollmentNumber"
                            value={form.enrollmentNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* ========== 2. Academic Info ========== */}
            <div className="profile-section">
                <h3>📚 Academic Information</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Last Sem SGPA</label>
                        <input
                            name="lastSemSGPA"
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={form.lastSemSGPA}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>MSC 1</label>
                        <input
                            name="MSC1"
                            type="number"
                            step="0.01"
                            value={form.MSC1}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>MSC 2</label>
                        <input
                            name="MSC2"
                            type="number"
                            step="0.01"
                            value={form.MSC2}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Last Year Result</label>
                        <input
                            name="lastYearResult"
                            value={form.lastYearResult}
                            onChange={handleChange}
                            placeholder="e.g. Pass / Fail / First Class"
                        />
                    </div>
                    <div className="profile-field">
                        <label>Attendance (%)</label>
                        <input
                            name="attendance"
                            type="number"
                            min="0"
                            max="100"
                            value={form.attendance}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="profile-field">
                        <label>Backlogs</label>
                        <input
                            name="backlogs"
                            type="number"
                            min="0"
                            value={form.backlogs}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* ========== 3. Skills & Career ========== */}
            <div className="profile-section">
                <h3>🚀 Skills & Career</h3>
                <div className="profile-form-grid">
                    <div className="profile-field" style={{ gridColumn: "1 / -1" }}>
                        <label>Career Goal</label>
                        <input
                            name="careerGoal"
                            value={form.careerGoal}
                            onChange={handleChange}
                            placeholder="e.g. Full-Stack Developer, Data Scientist"
                        />
                    </div>
                </div>

                {/* Technical Skills (tags) */}
                <div className="profile-field" style={{ marginTop: "1rem" }}>
                    <label>Technical Skills</label>
                    <div className="skills-input-row">
                        <input
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            placeholder="Type a skill & press Add"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkill("technicalSkills", techInput, setTechInput);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                addSkill("technicalSkills", techInput, setTechInput)
                            }
                        >
                            Add
                        </button>
                    </div>
                    <div className="skills-tags">
                        {form.technicalSkills.map((skill, i) => (
                            <span key={i} className="skill-tag">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill("technicalSkills", i)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Soft Skills (tags) */}
                <div className="profile-field" style={{ marginTop: "1rem" }}>
                    <label>Soft Skills</label>
                    <div className="skills-input-row">
                        <input
                            value={softInput}
                            onChange={(e) => setSoftInput(e.target.value)}
                            placeholder="Type a skill & press Add"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    addSkill("softSkills", softInput, setSoftInput);
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => addSkill("softSkills", softInput, setSoftInput)}
                        >
                            Add
                        </button>
                    </div>
                    <div className="skills-tags">
                        {form.softSkills.map((skill, i) => (
                            <span key={i} className="skill-tag">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill("softSkills", i)}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="profile-form-grid" style={{ marginTop: "1rem" }}>
                    <div className="profile-field">
                        <label>Certifications</label>
                        <textarea
                            name="certifications"
                            value={form.certifications}
                            onChange={handleChange}
                            placeholder="List your certifications..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>Projects</label>
                        <textarea
                            name="projects"
                            value={form.projects}
                            onChange={handleChange}
                            placeholder="Describe your projects..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>LinkedIn URL</label>
                        <input
                            name="linkedin"
                            value={form.linkedin}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>GitHub URL</label>
                        <input
                            name="github"
                            value={form.github}
                            onChange={handleChange}
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* ========== 4. Performance Metrics (Read Only) ========== */}
            <div className="profile-section">
                <h3>📊 Performance Metrics</h3>
                <div className="perf-grid">
                    <div className="perf-card">
                        <p className="perf-value purple">{performance.academicProgress}%</p>
                        <p className="perf-label">Academic Progress</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value green">{performance.skillProgress}%</p>
                        <p className="perf-label">Skill Progress</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value blue">{performance.productivityScore}</p>
                        <p className="perf-label">Productivity Score</p>
                    </div>
                    <div className="perf-card">
                        <p className="perf-value orange">{performance.taskStreak}</p>
                        <p className="perf-label">Task Streak</p>
                    </div>
                </div>
            </div>

            {/* ========== 5. Achievements & Hobbies ========== */}
            <div className="profile-section">
                <h3>🏆 Achievements & Hobbies</h3>
                <div className="profile-form-grid">
                    <div className="profile-field">
                        <label>Achievements</label>
                        <textarea
                            name="achievements"
                            value={form.achievements}
                            onChange={handleChange}
                            placeholder="Your accomplishments..."
                        />
                    </div>
                    <div className="profile-field">
                        <label>Hobbies</label>
                        <textarea
                            name="hobbies"
                            value={form.hobbies}
                            onChange={handleChange}
                            placeholder="What do you enjoy doing..."
                        />
                    </div>
                </div>
            </div>

            {/* ========== Save Button ========== */}
            <div className="profile-save-row">
                <button
                    className="profile-save-btn"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </div>
    );
}

export default Profile;
