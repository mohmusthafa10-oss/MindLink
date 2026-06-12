import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";

// Icons
const UserIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
  </svg>
);

const LightningIcon = () => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
  </svg>
);

const PhoneIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 1.23 0 2.45.2 3.57.57.35.12.75.03 1.02-.24l2.2 2.2z"></path>
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  // Mock data to match visual requirements (can be connected to API later)
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming token is stored here
        if (!token) {
          // Handle no token case (redirect to login?)
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="profile-container" style={{ textAlign: "center", marginTop: "50px" }}>Loading profile...</div>;
  }

  if (!profile) {
    return <div className="profile-container" style={{ textAlign: "center", marginTop: "50px" }}>Please log in to view profile.</div>;
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar-large">
          <UserIcon />
        </div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          <button
            className="sos-btn"
            onClick={() => navigate('/crisis')}
            style={{
              marginTop: '10px',
              backgroundColor: '#ed7676ff',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
            }}
          >
            <PhoneIcon /> SOS Help
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-title">Total Sessions</span>
          <span className="stat-value">{profile.totalSessions}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Current Mood</span>
          <span className={`stat-value ${['Anxious', 'Sad', 'Angry', 'Depressed', 'Tired', 'Miserable', 'Frustrated', 'Bad', 'Down', 'Nervous', 'Declining'].includes(profile.moodTrend) ? 'trend-negative' : 'trend-positive'}`}>{profile.moodTrend}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="activity-header">
          <h2>Recent Activity</h2>
          <p className="activity-subtitle">Here's a look at your recent interactions on MindLink.</p>
        </div>

        <div className="activity-list">
          {profile.activity.map(item => (
            <div key={item.id} className="activity-item">
              <div className="activity-icon">
                {item.type === 'mood' ? <LightningIcon /> : <ChatBubbleIcon />}
              </div>
              <div className="activity-content">
                <p className="activity-text">{item.text}</p>
                <p className="activity-time">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
