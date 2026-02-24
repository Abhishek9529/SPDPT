import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [careerGoal, setCareerGoal] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- Client-side validation ---
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            alert("Full name is required.");
            return;
        }
        if (/^\d+$/.test(trimmedName)) {
            alert("Name cannot be only numbers. Please enter your real name.");
            return;
        }
        if (trimmedName.length < 2) {
            alert("Name must be at least 2 characters.");
            return;
        }
        if (!trimmedEmail) {
            alert("Email is required.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            alert("Please enter a valid email address.");
            return;
        }
        if (!password) {
            alert("Password is required.");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        try {
            const res = await API.post("/students", {
                name: trimmedName,
                email: trimmedEmail,
                password,
                branch,
                semester,
                careerGoal
            });

            alert(res.data.message || "Registration successful");
            navigate("/"); // Go to login page after registration

        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-card">
                <h2>Student Registration</h2>

                <form className="register-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        placeholder="Branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                    />
                    <input
                        placeholder="Semester"
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                    />
                    <input
                        placeholder="Career Goal"
                        value={careerGoal}
                        onChange={(e) => setCareerGoal(e.target.value)}
                    />
                    <button type="submit">Register</button>
                </form>

                <div className="register-footer">
                    Already have an account? <Link to="/">Login here</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
