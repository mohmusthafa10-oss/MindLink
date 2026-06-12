import { createContext, useState, useEffect } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      // Redirect admins directly to the admin panel
      navigate(data.user?.is_admin ? "/admin" : "/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || "Login failed. Please check your credentials."
      };

    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const response = await fetch('http://localhost:5000/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            const userObj = { id: userData.id, username: userData.username, email: userData.email };
            setUser(userObj);
            localStorage.setItem("user", JSON.stringify(userObj));
          }
        } catch (err) {
          console.error("Failed to fetch user context", err);
        }
      }
    };
    fetchUser();
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

