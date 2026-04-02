import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../app/apiClient";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import { Users, UserCheck, Clock, AlertTriangle, Plus, Search, Building, ChevronRight, BarChart3, MapPin, Eye, Edit, Trash2, Download,Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import "./AdminDashboard.css";


const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showWeeklyChart, setShowWeeklyChart] = useState(false);
  const [showPurposeChart, setShowPurposeChart] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [visitData, setVisitData] = useState([]);
  const [purposeData, setPurposeData] = useState([]);
  const COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#f59e0b"];
  const [stats, setStats] = useState({
  totalUsers: 0,
  activeVisitors: 0,
  pendingApprovals: 0,
  alerts: 0
});
const navigate = useNavigate();

const fetchUsers = async () => {
  try {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  } catch (err) {
    console.error(err);
  }
};

const fetchSites = async () => {
  const res = await API.get("/admin/sites");
  setSites(res.data);
};
const fetchStats = async () => {
  try {
    const res = await API.get("/admin/stats");
    setStats(res.data);
  } catch (err) {
    console.error(err);
  }
};

const fetchCharts = async () => {
  try {
    const res = await API.get("/admin/charts");
    setVisitData(res.data.visitData);
    setPurposeData(res.data.purposeData);
  } catch (err) {
    console.error(err);
  }
};
const handleAdminPhoto = async (e, user_id) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await API.post("/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const image_url = res.data.image_url;
    await API.put(`/update-user-photo/${user_id}`, {
      photo_url: image_url
    });

    alert("✅ Photo Updated");

    fetchUsers();

  } catch (err) {
    console.error(err);
    alert("❌ Upload failed");
  }
};
useEffect(() => {
  fetchSites();
  fetchStats();
  fetchCharts();
  fetchUsers();
}, []);

  return (
    <div className="admin-dashboard">
      <Navbar role="admin" userName="Admin User" />
      <div className="admin-main-content">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage users, sites, and monitor visitor activity</p>
          </div>
          <div className="admin-header-actions">
          <button className="admin-btn-secondary"
            onClick={() => navigate("/export")}>
            <Download size={16} /> Export Report
          </button>
            <button className="admin-btn-primary" style={{ backgroundColor: '#ef4444' }}>
              <AlertTriangle size={16} /> Visitor Muster
            </button>
            <button className="admin-btn-primary">
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>

        <div className="admin-stats-grid">
          <StatCard label="Total Users" value={stats.users} icon={<Users size={22} />} iconBg="hsl(217, 91%, 60%, 0.1)" iconColor="hsl(217, 91%, 60%)" trend={{ value: "12% this month", positive: true }} />
          <StatCard label="Active Visitors" value={stats.visitors} icon={<UserCheck size={22} />} iconBg="hsl(152, 81%, 90%)" iconColor="hsl(164, 86%, 20%)" trend={{ value: "8% today", positive: true }} />
          <StatCard label="Pending Approvals" value={stats.pending} icon={<Clock size={22} />} iconBg="hsl(48, 96%, 89%)" iconColor="hsl(26, 90%, 31%)" trend={{ value: "3 urgent", positive: false }} />
          <StatCard label="Security Alerts" value={stats.alerts} icon={<AlertTriangle size={22} />} iconBg="hsl(0, 93%, 94%)" iconColor="hsl(0, 72%, 51%)" trend={{ value: "2 resolved", positive: true }} />
        </div>

        <div className="admin-chart-toggles" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`admin-btn-secondary ${showWeeklyChart ? 'active' : ''}`}
            onClick={() => setShowWeeklyChart(!showWeeklyChart)}
            style={{ flex: 1, justifyContent: 'center', background: showWeeklyChart ? 'rgba(37, 99, 235, 0.1)' : '', borderColor: showWeeklyChart ? '#2563eb' : '' }}
          >
            <BarChart3 size={18} /> {showWeeklyChart ? 'Hide Weekly Visitors' : 'Show Weekly Visitors'}
          </button>
          <button
            className={`admin-btn-secondary ${showPurposeChart ? 'active' : ''}`}
            onClick={() => setShowPurposeChart(!showPurposeChart)}
            style={{ flex: 1, justifyContent: 'center', background: showPurposeChart ? 'rgba(37, 99, 235, 0.1)' : '', borderColor: showPurposeChart ? '#2563eb' : '' }}
          >
            <PieChart size={18} /> {showPurposeChart ? 'Hide Visit Purpose' : 'Show Visit Purpose'}
          </button>
        </div>

        {(showWeeklyChart || showPurposeChart) && (
          <div className="admin-expanded-charts" style={{ display: 'grid', gridTemplateColumns: showWeeklyChart && showPurposeChart ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '2rem' }}>
            {showWeeklyChart && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title"><BarChart3 size={18} /> Weekly Visitors</h3>
                </div>
                <div className="admin-chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={visitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
                      <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 32%, 91%)" }} />
                      <Bar dataKey="visitors" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            {showPurposeChart && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Visit Purpose</h3>
                </div>
                <div className="admin-chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={purposeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                       {purposeData.map((entry, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "0.8rem" }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="admin-dashboard-grid">
          <div className="admin-left-column">
            {/* Tabs */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="admin-tabs">
                  <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                    <Users size={16} /> User Management
                  </button>
                  <button className={`admin-tab ${activeTab === "sites" ? "active" : ""}`} onClick={() => setActiveTab("sites")}>
                    <Building size={16} /> Sites
                  </button>
                </div>
                <div className="admin-search-box">
                  <Search size={16} />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {activeTab === "users" && (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => (u.name || "").toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-avatar-wrapper">

                                <div className="admin-user-avatar">
                                  {user.profile_photo ? (
                                    <img
                                      src={user.profile_photo}
                                      alt="user"
                                      className="admin-avatar-img"
                                    />
                                  ) : (
                                    user.name.split(" ").map(n => n[0]).join("")
                                  )}
                                </div>

                                <div
                                  className="admin-camera-icon"
                                  onClick={() => document.getElementById(`admin-${user.id}`).click()}
                                >
                                  <Camera size={12} color="white" />
                                </div>

                                <input
                                  id={`admin-${user.id}`}
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden-input"
                                  onChange={(e) => handleAdminPhoto(e, user.id)}
                                />

                              </div>
                              <div>
                                <div className="admin-user-cell-name">{user.name}</div>
                                <div className="admin-user-cell-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="admin-role-tag">{user.role}</span></td>
                          <td>{user.department}</td>
                          <td>
                            <span className={`admin-status-badge ${user.status === "Active" ? "active" : "inactive"}`}>
                              <span className="admin-status-dot" /> {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "sites" && (
                <div className="admin-sites-list">
                  {sites.map((site, i) => (
                    <div key={i} className="admin-site-item">
                      <div className="admin-site-info">
                        <div className="admin-site-icon"><MapPin size={18} /></div>
                        <div>
                          <h4>{site.name}</h4>
                          <p>{site.address}</p>
                        </div>
                      </div>
                      <div className="admin-site-meta">
                        <span className="admin-site-visitors">{site.visitors} visitors today</span>
                        <span className={`admin-status-badge ${site.status === "Active" ? "active" : "maintenance"}`}>
                          <span className="admin-status-dot" /> {site.status}
                        </span>
                        <ChevronRight size={16} className="admin-site-arrow" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;