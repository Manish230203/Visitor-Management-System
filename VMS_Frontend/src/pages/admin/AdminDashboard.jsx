import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import { Users, UserCheck, Clock, AlertTriangle, Plus, Search, Building, ChevronRight, BarChart3, MapPin, Eye, Edit, Trash2, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import "./AdminDashboard.css";

const visitData = [
  { day: "Mon", visitors: 45 },
  { day: "Tue", visitors: 62 },
  { day: "Wed", visitors: 78 },
  { day: "Thu", visitors: 55 },
  { day: "Fri", visitors: 90 },
  { day: "Sat", visitors: 30 },
  { day: "Sun", visitors: 15 },
];

const purposeData = [
  { name: "Business", value: 40, color: "#2563eb" },
  { name: "Interview", value: 25, color: "#7c3aed" },
  { name: "Delivery", value: 20, color: "#0891b2" },
  { name: "Personal", value: 15, color: "#f59e0b" },
];

const recentUsers = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@company.com", role: "Host", department: "Engineering", status: "Active" },
  { id: 2, name: "Priya Sharma", email: "priya@company.com", role: "Manager", department: "HR", status: "Active" },
  { id: 3, name: "Anil Patel", email: "anil@company.com", role: "Security", department: "Operations", status: "Active" },
  { id: 4, name: "Sunita Devi", email: "sunita@company.com", role: "Host", department: "Marketing", status: "Inactive" },
  { id: 5, name: "Vikram Singh", email: "vikram@company.com", role: "Manager", department: "Finance", status: "Active" },
];

const sites = [
  { name: "Mumbai HQ", visitors: 156, status: "Active", address: "Bandra Kurla Complex" },
  { name: "Delhi Office", visitors: 89, status: "Active", address: "Connaught Place" },
  { name: "Bangalore Tech Park", visitors: 203, status: "Active", address: "Whitefield" },
  { name: "Chennai Center", visitors: 45, status: "Maintenance", address: "Anna Nagar" },
];

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showWeeklyChart, setShowWeeklyChart] = useState(false);
  const [showPurposeChart, setShowPurposeChart] = useState(false);

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
            <button className="admin-btn-secondary">
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
          <StatCard label="Total Users" value={248} icon={<Users size={22} />} iconBg="hsl(217, 91%, 60%, 0.1)" iconColor="hsl(217, 91%, 60%)" trend={{ value: "12% this month", positive: true }} />
          <StatCard label="Active Visitors" value={67} icon={<UserCheck size={22} />} iconBg="hsl(152, 81%, 90%)" iconColor="hsl(164, 86%, 20%)" trend={{ value: "8% today", positive: true }} />
          <StatCard label="Pending Approvals" value={12} icon={<Clock size={22} />} iconBg="hsl(48, 96%, 89%)" iconColor="hsl(26, 90%, 31%)" trend={{ value: "3 urgent", positive: false }} />
          <StatCard label="Security Alerts" value={3} icon={<AlertTriangle size={22} />} iconBg="hsl(0, 93%, 94%)" iconColor="hsl(0, 72%, 51%)" trend={{ value: "2 resolved", positive: true }} />
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
                          <Cell key={i} fill={entry.color} />
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-user-avatar">{user.name.split(" ").map(n => n[0]).join("")}</div>
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
                          <td>
                            <div className="admin-action-btns">
                              <button className="admin-icon-btn" title="View"><Eye size={15} /></button>
                              <button className="admin-icon-btn" title="Edit"><Edit size={15} /></button>
                              <button className="admin-icon-btn delete" title="Delete"><Trash2 size={15} /></button>
                            </div>
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