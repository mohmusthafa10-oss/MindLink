import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Profile from "./pages/Profile";
import Relax from "./pages/Relax";
import CrisisHelp from "./pages/CrisisHelp";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Resources from "./pages/Resources";

// Route that blocks admins from accessing it (redirects to /admin instead)
function UserOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user?.is_admin) return <Navigate to="/admin" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/crisis" element={<CrisisHelp />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={
          <UserOnlyRoute><Chat /></UserOnlyRoute>
        } />
        <Route path="/profile" element={<Profile />} />
        <Route path="/relax" element={<Relax />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/resources" element={<Resources />} />
      </Route>
    </Routes>
  );
}
