import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import StatCard from "../../components/StatCard/StatCard";
import { Users, UserCheck, Clock, AlertTriangle, Search, CheckCircle, XCircle, Eye, Camera, QrCode, Truck, Shield, UserPlus } from "lucide-react";
import "./SecurityDashboard.css";

const liveVisitors = [
  { id: 1, name: "Amit Verma", company: "TCS", host: "Rajesh Kumar", purpose: "Business Meeting", checkIn: "09:15 AM", badge: "V-1042", status: "Inside" },
  { id: 2, name: "Sneha Patel", company: "Infosys", host: "Priya Sharma", purpose: "Interview", checkIn: "09:45 AM", badge: "V-1043", status: "Inside" },
  { id: 3, name: "Ravi Deshmukh", company: "Wipro", host: "Anil Patel", purpose: "Delivery", checkIn: "10:00 AM", badge: "V-1044", status: "Overstay" },
  { id: 4, name: "Kavita Joshi", company: "HCL", host: "Sunita Devi", purpose: "Business Meeting", checkIn: "10:30 AM", badge: "V-1045", status: "Inside" },
  { id: 5, name: "Deepak Gupta", company: "Tech Mahindra", host: "Vikram Singh", purpose: "Maintenance", checkIn: "11:00 AM", badge: "V-1046", status: "Checked Out" },
];

const pendingRequests = [
  { id: 1, name: "Manoj Tiwari", company: "Accenture", host: "Rajesh Kumar", mobile: "+91 98765 43210", purpose: "Client Visit", time: "2 min ago" },
  { id: 2, name: "Anita Rao", company: "Deloitte", host: "Priya Sharma", mobile: "+91 87654 32109", purpose: "Interview", time: "5 min ago" },
  { id: 3, name: "Suresh Nair", company: "EY", host: "Vikram Singh", mobile: "+91 76543 21098", purpose: "Vendor Meeting", time: "8 min ago" },
];

const recentActivity = [
  { time: "11:15 AM", action: "Check-in", name: "Deepak Gupta", detail: "Badge V-1046 issued" },
  { time: "11:10 AM", action: "Approved", name: "Kavita Joshi", detail: "Approved by Sunita Devi" },
  { time: "10:55 AM", action: "Overstay Alert", name: "Ravi Deshmukh", detail: "Exceeded 2hr limit" },
  { time: "10:30 AM", action: "Check-in", name: "Kavita Joshi", detail: "Badge V-1045 issued" },
  { time: "10:00 AM", action: "Check-in", name: "Ravi Deshmukh", detail: "Badge V-1044 issued" },
];

const expectedVisitors = [
  { id: 1, name: "Arjun Reddy", company: "Zomato", host: "Vikram Singh", purpose: "Vendor Meeting", time: "02:00 PM" },
  { id: 2, name: "Pooja Hegde", company: "Swiggy", host: "Anil Patel", purpose: "Delivery", time: "03:30 PM" },
  { id: 3, name: "Rahul Sharma", company: "Google", host: "Sunita Devi", purpose: "Business Meeting", time: "04:15 PM" },
];

const SecurityDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("live");

  const getStatusClass = (status) => {
    switch (status) {
      case "Inside": return "inside";
      case "Overstay": return "overstay";
      case "Checked Out": return "checked-out";
      default: return "";
    }
  };

  return (
    <div className="security-dashboard">
      <Navbar role="security" userName="Guard" />
      <div className="security-main-content">
        <div className="security-page-header">
          <div>
            <h1 className="security-title">Security Dashboard</h1>
            <p className="security-subtitle">Monitor visitors, manage check-ins, and handle spot requests</p>
          </div>
          <div className="security-header-actions">
            <button className="security-btn-primary" style={{ backgroundColor: '#ef4444' }}>
              <Shield size={16} /> Emergency Muster
            </button>
            <button className="security-btn-primary">
              <UserPlus size={16} /> Add Employee
            </button>
            <button className="security-btn-primary">
              <QrCode size={16} /> Scan QR
            </button>
          </div>
        </div>

        <div className="security-stats-grid">
          <StatCard label="Visitors Inside" value={34} icon={<Users size={22} />} iconBg="hsl(217, 91%, 60%, 0.1)" iconColor="hsl(217, 91%, 60%)" />
          <StatCard label="Expected Today" value={52} icon={<UserCheck size={22} />} iconBg="hsl(152, 81%, 90%)" iconColor="hsl(164, 86%, 20%)" />
          <StatCard label="Pending Approval" value={3} icon={<Clock size={22} />} iconBg="hsl(48, 96%, 89%)" iconColor="hsl(26, 90%, 31%)" />
          <StatCard label="Overstay Alerts" value={2} icon={<AlertTriangle size={22} />} iconBg="hsl(0, 93%, 94%)" iconColor="hsl(0, 72%, 51%)" />
        </div>

        {/* Quick Actions Row */}
        <div className="security-quick-actions-row">
          <button className="security-qa-card"><Camera size={20} /> <span>Capture Photo</span></button>
          <button className="security-qa-card"><QrCode size={20} /> <span>Scan Gate Pass</span></button>
          <button className="security-qa-card"><Truck size={20} /> <span>Log Vehicle</span></button>
        </div>

        {/* Search Bar removed */}

        <div className="security-dashboard-grid">
          <div className="security-left-column">
            {/* Live / Pending toggle */}
            <div className="security-card">
              <div className="security-card-header">
                <div className="security-tabs">
                  <button className={`security-tab ${activeView === "live" ? "active" : ""}`} onClick={() => setActiveView("live")}>
                    <Users size={16} /> Live Visitors ({liveVisitors.filter(v => v.status !== "Checked Out").length})
                  </button>
                  <button className={`security-tab ${activeView === "pending" ? "active" : ""}`} onClick={() => setActiveView("pending")}>
                    <Clock size={16} /> Spot Requests ({pendingRequests.length})
                  </button>
                  <button className={`security-tab ${activeView === "expected" ? "active" : ""}`} onClick={() => setActiveView("expected")}>
                    <UserCheck size={16} /> Expected Visitors
                  </button>
                  <button className={`security-tab ${activeView === "search" ? "active" : ""}`} onClick={() => setActiveView("search")}>
                    <Search size={16} /> Search
                  </button>
                </div>
              </div>

              {activeView === "live" && (
                <div className="security-table-container">
                  <table className="security-table">
                    <thead>
                      <tr>
                        <th>Visitor</th>
                        <th>Host</th>
                        <th>Badge</th>
                        <th>Check-In</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveVisitors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.badge.toLowerCase().includes(searchQuery.toLowerCase())).map(v => (
                        <tr key={v.id}>
                          <td>
                            <div className="security-visitor-cell">
                              <div className="security-visitor-avatar">{v.name.split(" ").map(n => n[0]).join("")}</div>
                              <div>
                                <div className="security-visitor-name">{v.name}</div>
                                <div className="security-visitor-company">{v.company} · {v.purpose}</div>
                              </div>
                            </div>
                          </td>
                          <td>{v.host}</td>
                          <td><span className="security-badge-tag">{v.badge}</span></td>
                          <td>{v.checkIn}</td>
                          <td>
                            <span className={`security-status ${getStatusClass(v.status)}`}>
                              <span className="security-status-dot" /> {v.status}
                            </span>
                          </td>
                          <td>
                            <div className="security-action-btns">
                              <button className="security-icon-btn" title="View"><Eye size={15} /></button>
                              {v.status !== "Checked Out" && (
                                <button className="security-checkout-btn" title="Check Out">Check Out</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeView === "pending" && (
                <div className="security-requests-list">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="security-request-item">
                      <div className="security-request-info">
                        <div className="security-visitor-avatar">{req.name.split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <h4>{req.name}</h4>
                          <div className="security-request-meta">
                            <span>{req.company}</span> · <span>{req.purpose}</span> · <span>Host: {req.host}</span>
                          </div>
                          <span className="security-time-tag">{req.time}</span>
                        </div>
                      </div>
                      <div className="security-request-actions">
                        <button className="security-reject-btn"><XCircle size={16} /> Reject</button>
                        <button className="security-approve-btn"><CheckCircle size={16} /> Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeView === "expected" && (
                <div className="security-requests-list">
                  {expectedVisitors.map(req => (
                    <div key={req.id} className="security-request-item">
                      <div className="security-request-info">
                        <div className="security-visitor-avatar">{req.name.split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <h4>{req.name}</h4>
                          <div className="security-request-meta">
                            <span>{req.company}</span> · <span>{req.purpose}</span> · <span>Host: {req.host}</span>
                          </div>
                          <span className="security-time-tag">Expected at {req.time}</span>
                        </div>
                      </div>
                      <div className="security-request-actions">
                        <button className="security-approve-btn"><CheckCircle size={16} /> Mark Arrived</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === "search" && (
                <div className="security-search-tab-view" style={{ padding: '1.5rem' }}>
                  <div className="security-search-bar" style={{ marginBottom: '1.5rem' }}>
                    <Search size={20} />
                    <input autoFocus type="text" placeholder="Search visitor by Name, Mobile, Badge ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>

                  {searchQuery.length > 0 ? (
                    <div className="security-table-container">
                      <table className="security-table">
                        <thead>
                          <tr>
                            <th>Visitor</th>
                            <th>Host</th>
                            <th>Badge</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveVisitors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.badge.toLowerCase().includes(searchQuery.toLowerCase())).map(v => (
                            <tr key={v.id}>
                              <td>
                                <div className="security-visitor-cell">
                                  <div className="security-visitor-avatar">{v.name.split(" ").map(n => n[0]).join("")}</div>
                                  <div>
                                    <div className="security-visitor-name">{v.name}</div>
                                    <div className="security-visitor-company">{v.company}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{v.host}</td>
                              <td><span className="security-badge-tag">{v.badge}</span></td>
                              <td>
                                <span className={`security-status ${getStatusClass(v.status)}`}>
                                  <span className="security-status-dot" /> {v.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {liveVisitors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.badge.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#627d98' }}>No visitors found matching "{searchQuery}"</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#829ab1' }}>
                      <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                      <p>Type a name, mobile number, or badge ID to search</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          <div className="security-right-column">
            {/* Recent Activity */}
            <div className="security-card">
              <div className="security-card-header">
                <h3 className="security-card-title">Recent Activity</h3>
              </div>
              <div className="security-activity-list">
                {recentActivity.map((act, i) => (
                  <div key={i} className="security-activity-item">
                    <span className="security-activity-time">{act.time}</span>
                    <div className="security-activity-content">
                      <div className="security-activity-dot" />
                      <div>
                        <span className="security-activity-action">{act.action}</span>
                        <span className="security-activity-name"> — {act.name}</span>
                        <p className="security-activity-detail">{act.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;