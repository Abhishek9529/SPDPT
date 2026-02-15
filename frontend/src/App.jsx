import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import Goals from "./pages/Goals";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import ProfileSetup from "./pages/ProfileSetup";
import Navbar from "./components/Navbar";
import "./App.css";

// Layout component that conditionally shows Navbar
function Layout({ children }) {
  const location = useLocation();

  // Don't show Navbar on Login and ProfileSetup pages
  const showNavbar = location.pathname !== "/" && location.pathname !== "/profile-setup";

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
