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

        try {
            const res = await API.post("/students", {
                name,
                email,
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
