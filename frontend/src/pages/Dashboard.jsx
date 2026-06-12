import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/globals.css";

const cardStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  border: "1px solid #e1e8e8",
  transition: "transform 0.2s",
  height: "100%",
  cursor: "pointer",
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.is_admin;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#2c3e50", marginBottom: "10px" }}>
          {isAdmin ? `Welcome, Admin ${user?.username || ""}` : "Welcome to MindLink"}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#7f8c8d" }}>
          {isAdmin
            ? "You are logged in as an administrator."
            : "Your personal space for mental wellness and growth."}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Admin Panel Card — only for admins */}
        {isAdmin && (
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <div style={{ ...cardStyle, border: "1px solid #b2dfdb" }}>
              <h2 style={{ color: "#009688", marginTop: 0 }}>⚙️ Admin Panel</h2>
              <p style={{ color: "#555" }}>
                Manage users, view statistics, and monitor application activity.
              </p>
            </div>
          </Link>
        )}

        {/* Chat Card — hidden for admins */}
        {!isAdmin && (
          <Link to="/chat" style={{ textDecoration: "none" }}>
            <div style={cardStyle}>
              <h2 style={{ color: "#6c63ff", marginTop: 0 }}>AI Companion</h2>
              <p style={{ color: "#555" }}>Chat with your empathetic AI partner, friend, or therapist.</p>
            </div>
          </Link>
        )}

        {/* Profile Card — hidden for admins */}
        {!isAdmin && (
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <div style={cardStyle}>
              <h2 style={{ color: "#ff8b94", marginTop: 0 }}>My Profile</h2>
              <p style={{ color: "#555" }}>Manage your account settings and preferences.</p>
            </div>
          </Link>
        )}

        {/* Resources Card */}
        <Link to="/resources" style={{ textDecoration: "none" }}>
          <div style={cardStyle}>
            <h2 style={{ color: "#00b894", marginTop: 0 }}>Resources</h2>
            <p style={{ color: "#555" }}>Access articles, exercises, and helpful guides.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
