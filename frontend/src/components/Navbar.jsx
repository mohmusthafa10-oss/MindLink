import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/navbar.css";

// Brain/Connection Icon
const MindLinkIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 5.1c-3.5 0-6 2.5-6 6.9c0 4.4 2.5 6.9 6 6.9" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M10 5.1v13.8" strokeLinecap="round"></path>
    <path d="M10 8h5a2 2 0 100-4" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M10 12h7a1.5 1.5 0 100-3" strokeLinecap="round" strokeLinejoin="round"></path>
    <path d="M10 16h5a2 2 0 100 4" strokeLinecap="round" strokeLinejoin="round"></path>
    <circle cx="15" cy="4" r="1.5" fill="currentColor" stroke="none"></circle>
    <circle cx="17" cy="9" r="1.5" fill="currentColor" stroke="none"></circle>
    <circle cx="15" cy="20" r="1.5" fill="currentColor" stroke="none"></circle>
  </svg>
);

const GamePadIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path fill="none" d="M0 0h24v24H0z"></path><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
  </svg>
);

const BookIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 1.23 0 2.45.2 3.57.57.35.12.75.03 1.02-.24l2.2 2.2z"></path>
  </svg>
);


export default function Navbar() {
  const { logout, isAuth, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuth) return null; // Don't show navbar if not logged in

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleNav = (path) => {
    setIsOpen(false);
    navigate(path);
  }

  // Get initial
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U");

  return (
    <nav className="navbar">
      {/* Left: Brand */}
      <Link to="/" className="navbar-brand">
        <span className="brand-icon"><MindLinkIcon /></span>
        <h1 className="brand-text">MindLink</h1>
      </Link>

      {/* Right: Profile & Menu */}
      <div className="navbar-profile" ref={dropdownRef}>

        {!user?.is_admin && (
          <div className="relax-text" style={{ marginRight: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => handleNav("/relax")}>
            <GamePadIcon style={{ fontSize: '1.2rem' }} />
            <span>Relax</span>
          </div>
        )}

        <div className="relax-text" style={{ marginRight: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => handleNav("/resources")}>
          <BookIcon style={{ fontSize: '1.2rem' }} />
          <span>Res.</span>
        </div>



        <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
          <div className="profile-avatar">
            <span>{initial}</span>
          </div>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <span className="user-name">{user?.username || "Guest"}</span>
              <span className="user-email">{user?.email || "guest@example.com"}</span>
            </div>

            <button className="dropdown-item" onClick={() => handleNav("/dashboard")}>
              Dashboard
            </button>
            {!user?.is_admin && (
              <button className="dropdown-item" onClick={() => handleNav("/chat")}>
                Chat
              </button>
            )}
            {!user?.is_admin && (
              <button className="dropdown-item" onClick={() => handleNav("/profile")}>
                Profile Settings
              </button>
            )}

            {user?.is_admin && (
              <button className="dropdown-item" style={{ color: '#009688', fontWeight: 'bold' }} onClick={() => handleNav("/admin")}>
                Admin Panel
              </button>
            )}

            <div className="dropdown-divider"></div>

            <button className="dropdown-item logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
