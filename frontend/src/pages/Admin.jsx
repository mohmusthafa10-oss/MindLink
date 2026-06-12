import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

/* ─── Icons ─── */
const VerifiedIcon = () => (
    <svg stroke="currentColor" fill="#4caf50" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
    </svg>
);
const MoreVerticalIcon = () => (
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
    </svg>
);
const UsersIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="1.1em" width="1.1em"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChartIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="1.1em" width="1.1em"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const AlertIcon = () => <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" height="1.1em" width="1.1em"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const API = "http://localhost:5000/api/admin";

/* ─── Mini Bar Chart (pure CSS/SVG) ─── */
function BarChart({ data, color = "#009688", label }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="chart-wrapper">
            <div className="chart-title">{label}</div>
            <div className="bar-chart">
                {data.map((d, i) => (
                    <div key={i} className="bar-col">
                        <div className="bar-fill-wrap">
                            <div
                                className="bar-fill"
                                style={{
                                    height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%`,
                                    background: color
                                }}
                                title={`${d.value}`}
                            />
                        </div>
                        <span className="bar-label">{d.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Donut Chart (SVG) ─── */
function DonutChart({ data }) {
    const COLORS = ["#009688", "#6c63ff", "#ff8b94", "#f39c12", "#e74c3c", "#3498db", "#2ecc71", "#9b59b6"];
    const total = data.reduce((s, d) => s + d.count, 0) || 1;
    let cumulative = 0;
    const radius = 60, cx = 80, cy = 80, stroke = 28;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="chart-wrapper">
            <div className="chart-title">Mood Distribution</div>
            <div className="donut-row">
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
                    {data.map((d, i) => {
                        const pct = d.count / total;
                        const offset = circumference * (1 - cumulative);
                        const dasharray = `${circumference * pct} ${circumference * (1 - pct)}`;
                        cumulative += pct;
                        return (
                            <circle key={i} cx={cx} cy={cy} r={radius}
                                fill="none"
                                stroke={COLORS[i % COLORS.length]}
                                strokeWidth={stroke}
                                strokeDasharray={dasharray}
                                strokeDashoffset={offset}
                                transform={`rotate(-90 ${cx} ${cy})`}
                            />
                        );
                    })}
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="12" fill="#7f8c8d">Total</text>
                    <text x={cx} y={cy + 12} textAnchor="middle" fontSize="20" fontWeight="700" fill="#2c3e50">{total}</text>
                </svg>
                <div className="donut-legend">
                    {data.map((d, i) => (
                        <div key={i} className="legend-item">
                            <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="legend-label">{d.label}</span>
                            <span className="legend-count">{d.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN ADMIN COMPONENT
═══════════════════════════════════════════ */
const Admin = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalSessions: 0, activeToday: 0 });
    const [analytics, setAnalytics] = useState(null);
    const [crisisAlerts, setCrisisAlerts] = useState([]);
    const [unresolvedCount, setUnresolvedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const headers = { Authorization: `Bearer ${token}` };

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const h = () => setActiveMenuId(null);
        document.addEventListener("click", h);
        return () => document.removeEventListener("click", h);
    }, []);

    /* ── Auth guard ── */
    useEffect(() => {
        if (!user) return;
        if (!user.is_admin) { navigate("/dashboard"); return; }
    }, [user]);

    /* ── Fetch users + stats ── */
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API}/users`, { headers });
            if (!res.ok) { if (res.status === 401) { logout(); return; } throw new Error(); }
            const data = await res.json();
            setUsers(data.users);
            setStats(data.stats);
        } catch { setError("Failed to load users"); }
        finally { setLoading(false); }
    }, [token]);

    /* ── Fetch analytics ── */
    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await fetch(`${API}/analytics`, { headers });
            if (res.ok) setAnalytics(await res.json());
        } catch { /* non-critical */ }
    }, [token]);

    /* ── Fetch crisis alerts ── */
    const fetchCrisis = useCallback(async () => {
        try {
            const res = await fetch(`${API}/crisis-alerts`, { headers });
            if (res.ok) {
                const data = await res.json();
                setCrisisAlerts(data.alerts);
                setUnresolvedCount(data.unresolvedCount);
            }
        } catch { /* non-critical */ }
    }, [token]);

    useEffect(() => {
        if (!user?.is_admin) return;
        fetchUsers();
        fetchAnalytics();
        fetchCrisis();
    }, [user, token]);

    /* ── Actions ── */
    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${API}/users/${userId}`, { method: "DELETE", headers });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete user");
            }
        } catch { alert("Connection error"); }
    };

    const handleViewDetails = async (userId) => {
        const basicInfo = users.find(u => u.id === userId);
        setSelectedUser({ ...basicInfo, loading: true });
        try {
            const res = await fetch(`${API}/users/${userId}`, { headers });
            if (res.ok) setSelectedUser(await res.json());
            else alert("Failed to fetch user details");
        } catch { alert("Connection error"); }
    };

    const handleResolveAlert = async (alertId) => {
        try {
            const res = await fetch(`${API}/crisis-alerts/${alertId}/resolve`, { method: "PATCH", headers });
            if (res.ok) {
                setCrisisAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
                setUnresolvedCount(prev => Math.max(0, prev - 1));
            }
        } catch { alert("Connection error"); }
    };

    if (loading) return (
        <div className="admin-container">
            <div className="admin-loading">
                <div className="loading-spinner" />
                <p>Loading Admin Panel...</p>
            </div>
        </div>
    );
    if (error) return <div className="admin-container"><p style={{ color: "#e74c3c" }}>⚠ {error}</p></div>;

    const formattedLogin = user?.last_login || new Date().toLocaleString();

    return (
        <div className="admin-container">
            {/* ── Header ── */}
            <header className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <div className="admin-profile-row">
                        <span className="welcome-text">Welcome back, {user?.username}</span>
                        <VerifiedIcon />
                        <span className="role-badge">(Super Admin)</span>
                    </div>
                    <p className="last-login-info">Last Login: {formattedLogin}</p>
                </div>
            </header>

            {/* ── Stat Cards ── */}
            <div className="admin-stats">
                <div className="stat-box">
                    <h3>Total Users</h3>
                    <p>{analytics?.summary?.totalUsers ?? stats.totalUsers}</p>
                </div>
                <div className="stat-box">
                    <h3>Total Sessions</h3>
                    <p>{analytics?.summary?.totalSessions ?? stats.totalSessions}</p>
                </div>
                <div className="stat-box">
                    <h3>Total Messages</h3>
                    <p>{analytics?.summary?.totalMessages ?? "—"}</p>
                </div>
                <div className="stat-box stat-box--danger">
                    <h3>Crisis Alerts</h3>
                    <p>{analytics?.summary?.totalCrisisAlerts ?? "—"}</p>
                    {unresolvedCount > 0 && <span className="unresolved-badge">{unresolvedCount} unresolved</span>}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="admin-tabs">
                <button className={`tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                    <UsersIcon /> Users
                </button>
                <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
                    <ChartIcon /> Analytics
                </button>
                <button className={`tab-btn ${activeTab === "crisis" ? "active" : ""}`} onClick={() => setActiveTab("crisis")}>
                    <AlertIcon /> Crisis Alerts
                    {unresolvedCount > 0 && <span className="tab-badge">{unresolvedCount}</span>}
                </button>
            </div>

            {/* ══════════════════ TAB: USERS ══════════════════ */}
            {activeTab === "users" && (
                <div className="users-section">
                    <h2>User Management</h2>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th><th>Username</th><th>Email</th>
                                    <th>Role</th><th>Last Login</th><th>Active Time</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>#{u.id}</td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-small">{u.username[0].toUpperCase()}</div>
                                                {u.username}
                                                {u.is_admin && <span style={{ marginLeft: 4 }}><VerifiedIcon /></span>}
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.is_admin ? "admin-badge" : "user-badge"}`}>
                                                {u.is_admin ? "Admin" : "User"}
                                            </span>
                                        </td>
                                        <td>{u.last_login}</td>
                                        <td>{u.time_spent} mins</td>
                                        <td>
                                            <div className="action-menu-container">
                                                <button className="icon-btn" onClick={e => { e.stopPropagation(); setActiveMenuId(activeMenuId === u.id ? null : u.id); }}>
                                                    <MoreVerticalIcon />
                                                </button>
                                                {activeMenuId === u.id && (
                                                    <div className="action-dropdown">
                                                        <button onClick={() => handleViewDetails(u.id)}>View Details</button>
                                                        {!u.is_admin && (
                                                            <button className="text-danger" onClick={() => handleDeleteUser(u.id, u.username)}>
                                                                Delete User
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══════════════════ TAB: ANALYTICS ══════════════════ */}
            {activeTab === "analytics" && (
                <div className="analytics-section">
                    <h2>📊 Analytics Overview — Last 7 Days</h2>
                    {!analytics ? (
                        <p style={{ color: "#7f8c8d" }}>Loading analytics...</p>
                    ) : (
                        <>
                            <div className="charts-grid">
                                <BarChart data={analytics.userGrowth} color="#009688" label="Daily Active Users" />
                                <BarChart data={analytics.sessionsPerDay} color="#6c63ff" label="Chat Sessions per Day" />
                                <BarChart data={analytics.crisisPerDay} color="#e74c3c" label="Crisis Alerts per Day" />
                                {analytics.moodDistribution?.length > 0
                                    ? <DonutChart data={analytics.moodDistribution} />
                                    : <div className="chart-wrapper"><div className="chart-title">Mood Distribution</div><p style={{ color: "#aaa", padding: "20px" }}>No mood data yet.</p></div>
                                }
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ══════════════════ TAB: CRISIS ALERTS ══════════════════ */}
            {activeTab === "crisis" && (
                <div className="users-section">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <h2 style={{ margin: 0 }}>🚨 Crisis Alert Monitor</h2>
                        {unresolvedCount > 0 && (
                            <span className="unresolved-badge large">{unresolvedCount} Unresolved</span>
                        )}
                    </div>
                    {crisisAlerts.length === 0 ? (
                        <div className="empty-state">
                            <p>✅ No crisis alerts recorded. All clear!</p>
                        </div>
                    ) : (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>User</th><th>Email</th><th>Message Preview</th>
                                        <th>Triggered At</th><th>Status</th><th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crisisAlerts.map(a => (
                                        <tr key={a.id} className={!a.resolved ? "crisis-row" : ""}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-avatar-small" style={{ background: a.resolved ? "#e0f2f1" : "#ffebee", color: a.resolved ? "#009688" : "#e74c3c" }}>
                                                        {a.username[0]?.toUpperCase()}
                                                    </div>
                                                    {a.username}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: "0.85rem", color: "#7f8c8d" }}>{a.email}</td>
                                            <td>
                                                <span className="message-preview">{a.message_snippet}</span>
                                            </td>
                                            <td style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>{a.triggered_at}</td>
                                            <td>
                                                <span className={`badge ${a.resolved ? "resolved-badge" : "alert-badge"}`}>
                                                    {a.resolved ? "✓ Resolved" : "⚠ Active"}
                                                </span>
                                            </td>
                                            <td>
                                                {!a.resolved && (
                                                    <button className="resolve-btn" onClick={() => handleResolveAlert(a.id)}>
                                                        Resolve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── User Details Modal ── */}
            {selectedUser && (
                <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button className="close-btn" onClick={() => setSelectedUser(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="user-profile-summary">
                                <div className="user-avatar-large">{selectedUser.username[0].toUpperCase()}</div>
                                <div>
                                    <h4>{selectedUser.username}</h4>
                                    <p className="user-email">{selectedUser.email}</p>
                                    {selectedUser.is_admin && <span className="badge admin-badge">Admin</span>}
                                </div>
                            </div>
                            {selectedUser.loading ? <p>Loading details…</p> : (
                                <div className="user-stats-grid">
                                    <div className="stat-item"><span className="stat-label">Total Sessions</span><span className="stat-value-small">{selectedUser.totalSessions}</span></div>
                                    <div className="stat-item"><span className="stat-label">Current Mood</span>
                                        <span className={`stat-value-small ${["Anxious", "Sad", "Angry", "Depressed"].includes(selectedUser.moodTrend) ? "text-danger" : "text-success"}`}>
                                            {selectedUser.moodTrend}
                                        </span>
                                    </div>
                                    <div className="stat-item"><span className="stat-label">Last Login</span><span className="stat-value-small" style={{ fontSize: "0.95rem" }}>{selectedUser.last_login}</span></div>
                                    <div className="stat-item"><span className="stat-label">Active Time</span><span className="stat-value-small">{selectedUser.time_spent}</span></div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setSelectedUser(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
