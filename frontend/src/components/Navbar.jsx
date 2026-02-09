import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear all stored data
        localStorage.removeItem("token");
        localStorage.removeItem("student");

        // Redirect to login page
        navigate("/");
    };

    return (
        <nav style={{
            display: "flex",
            gap: "20px",
            padding: "15px 20px",
            backgroundColor: "#333",
            alignItems: "center"
        }}>
            <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
            <Link to="/subjects" style={linkStyle}>Subjects</Link>
            <Link to="/goals" style={linkStyle}>Goals</Link>
            <Link to="/tasks" style={linkStyle}>Tasks</Link>

            <button
                onClick={handleLogout}
                style={{
                    marginLeft: "auto",
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                Logout
            </button>
        </nav>
    );
}

const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "16px"
};

export default Navbar;
