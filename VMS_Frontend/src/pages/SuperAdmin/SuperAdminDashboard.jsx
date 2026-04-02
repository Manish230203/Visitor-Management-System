import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import { Building, Users, Shield, Settings, Server, Globe, Key, Activity, ChevronRight, Search, Eye, Edit, ToggleLeft, BarChart3, FileText, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import "./SuperAdminDashboard.css";

const trafficData = [
  { month: "Jan", visitors: 1240 },
  { month: "Feb", visitors: 1580 },
  { month: "Mar", visitors: 1320 },
  { month: "Apr", visitors: 1890 },
  { month: "May", visitors: 2100 },
  { month: "Jun", visitors: 1950 },
];

const sitePerformance = [
  { site: "Mumbai", score: 95 },
  { site: "Delhi", score: 88 },
  { site: "Bangalore", score: 92 },
  { site: "Chennai", score: 78 },
  { site: "Pune", score: 85 },
];

const licenses = [
  { company: "Tata Corp", sites: 12, users: 340, status: "Active", expiry: "2026-12-31" },
  { company: "Reliance Industries", sites: 8, users: 210, status: "Active", expiry: "2026-09-15" },
  { company: "Infosys Ltd", sites: 15, users: 520, status: "Active", expiry: "2027-03-20" },
  { company: "Mahindra Group", sites: 5, users: 130, status: "Expiring Soon", expiry: "2026-04-01" },
  { company: "Wipro Technologies", sites: 3, users: 80, status: "Expired", expiry: "2026-01-15" },
];

const auditLogs = [
  { time: "Today, 11:30 AM", user: "Admin User", action: "Modified site configuration", target: "Mumbai HQ" },
  { time: "Today, 10:15 AM", user: "System", action: "Auto-purged expired visitor data", target: "All Sites" },
  { time: "Yesterday, 4:45 PM", user: "Priya Sharma", action: "Created new user role", target: "Security Manager" },
  { time: "Yesterday, 2:20 PM", user: "Admin User", action: "Updated license validity", target: "Mahindra Group" },
  { time: "Feb 24, 9:00 AM", user: "System", action: "Generated compliance report", target: "Q1 2026" },
];

const SuperAdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("licenses");

  const getStatusClass = (status) => {
    switch (status) {
      case "Active": return "active";
      case "Expiring Soon": return "expiring";
      case "Expired": return "expired";
      default: return "";
    }
  };

  return (
    <div className="superadmin-dashboard">
      <Navbar role="superadmin" userName="Super Admin" />
      <div className="superadmin-main-content">
        <div className="superadmin-page-header">
          <div>
            <h1 className="superadmin-title">Super Admin Console</h1>
            <p className="superadmin-subtitle">Global system configuration, license management, and compliance</p>
          </div>
          <div className="superadmin-header-actions">
            <button className="superadmin-btn-secondary">
              <FileText size={16} /> Generate Report
            </button>
            <button className="superadmin-btn-primary">
              <Settings size={16} /> System Config
            </button>
          </div>
        </div>

        <div className="superadmin-stats-grid">
          <StatCard label="Total Companies" value={5} icon={<Building size={22} />} iconBg="hsl(217, 91%, 60%, 0.1)" iconColor="hsl(217, 91%, 60%)" />
          <StatCard label="Active Sites" value={43} icon={<Globe size={22} />} iconBg="hsl(152, 81%, 90%)" iconColor="hsl(164, 86%, 20%)" />
          <StatCard label="Total Users" value="1,280" icon={<Users size={22} />} iconBg="hsl(270, 60%, 90%)" iconColor="hsl(270, 60%, 40%)" />
          <StatCard label="System Health" value="99.9%" icon={<Activity size={22} />} iconBg="hsl(48, 96%, 89%)" iconColor="hsl(26, 90%, 31%)" trend={{ value: "Uptime", positive: true }} />
        </div>

        {/* Config Cards */}
        <div className="superadmin-config-grid">
          {[
            { icon: <Building size={20} />, title: "Company & Site Master", desc: "Manage hierarchy, geo-coordinates" },
            { icon: <Shield size={20} />, title: "Roles & Permissions", desc: "Configure access control matrix" },
            { icon: <Key size={20} />, title: "License Manager", desc: "Set validity, toggle features" },
            { icon: <Server size={20} />, title: "System Settings", desc: "Docker instances, data purging" },
          ].map((item, i) => (
            <div key={i} className="superadmin-config-card">
              <div className="superadmin-config-icon">{item.icon}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <ChevronRight size={16} className="superadmin-config-arrow" />
            </div>
          ))}
        </div>

        <div className="superadmin-dashboard-grid">
          <div className="superadmin-left-column">
            <div className="superadmin-card">
              <div className="superadmin-card-header">
                <div className="superadmin-tabs">
                  <button className={`superadmin-tab ${activeTab === "licenses" ? "active" : ""}`} onClick={() => setActiveTab("licenses")}>
                    <Key size={16} /> License Manager
                  </button>
                  <button className={`superadmin-tab ${activeTab === "audit" ? "active" : ""}`} onClick={() => setActiveTab("audit")}>
                    <FileText size={16} /> Audit Logs
                  </button>
                </div>
                <div className="superadmin-search-box">
                  <Search size={16} />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {activeTab === "licenses" && (
                <div className="superadmin-table-container">
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Sites</th>
                        <th>Users</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {licenses.filter(l => l.company.toLowerCase().includes(searchQuery.toLowerCase())).map((lic, i) => (
                        <tr key={i}>
                          <td>
                            <div className="superadmin-company-cell">
                              <div className="superadmin-company-icon"><Building size={16} /></div>
                              <span className="superadmin-company-name">{lic.company}</span>
                            </div>
                          </td>
                          <td>{lic.sites}</td>
                          <td>{lic.users}</td>
                          <td>{lic.expiry}</td>
                          <td>
                            <span className={`superadmin-status ${getStatusClass(lic.status)}`}>
                              <span className="superadmin-status-dot" /> {lic.status}
                            </span>
                          </td>
                          <td>
                            <div className="superadmin-action-btns">
                              <button className="superadmin-icon-btn" title="View"><Eye size={15} /></button>
                              <button className="superadmin-icon-btn" title="Edit"><Edit size={15} /></button>
                              <button className="superadmin-icon-btn" title="Toggle"><ToggleLeft size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "audit" && (
                <div className="superadmin-audit-list">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="superadmin-audit-item">
                      <div className="superadmin-audit-icon">
                        <Activity size={14} />
                      </div>
                      <div className="superadmin-audit-content">
                        <div className="superadmin-audit-header">
                          <span className="superadmin-audit-user">{log.user}</span>
                          <span className="superadmin-audit-time">{log.time}</span>
                        </div>
                        <p className="superadmin-audit-action">{log.action}</p>
                        <span className="superadmin-audit-target">{log.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="superadmin-right-column">
            {/* Traffic Trend */}
            <div className="superadmin-card">
              <div className="superadmin-card-header">
                <h3 className="superadmin-card-title"><BarChart3 size={18} /> Visitor Trends</h3>
              </div>
              <div className="superadmin-chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trafficData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(214, 32%, 91%)" }} />
                    <Line type="monotone" dataKey="visitors" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} dot={{ fill: "hsl(217, 91%, 60%)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Site Performance */}
            <div className="superadmin-card">
              <div className="superadmin-card-header">
                <h3 className="superadmin-card-title">Site Compliance</h3>
              </div>
              <div className="superadmin-chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sitePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} />
                    <YAxis type="category" dataKey="site" tick={{ fontSize: 12, fill: "hsl(215, 16%, 47%)" }} width={70} />
                    <Tooltip contentStyle={{ borderRadius: "0.5rem" }} />
                    <Bar dataKey="score" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts */}
            <div className="superadmin-alerts-card">
              <div className="superadmin-alerts-header">
                <AlertTriangle size={18} />
                <h3>System Alerts</h3>
              </div>
              <div className="superadmin-alert-item warning">
                <span className="superadmin-alert-badge">Warning</span>
                Mahindra Group license expiring in 34 days
              </div>
              <div className="superadmin-alert-item error">
                <span className="superadmin-alert-badge">Critical</span>
                Wipro Technologies license expired
              </div>
              <div className="superadmin-alert-item info">
                <span className="superadmin-alert-badge">Info</span>
                Data purge scheduled for March 1, 2026
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;