import { useState,useEffect} from "react";
import API from "../../app/apiClient";
import StatCard from "../../components/StatCard/StatCard";
import VisitorPassForm from "../../components/forms/VisitorPassForm"
import { Users, UserCheck, Clock, AlertTriangle, Search, CheckCircle, XCircle, Eye, Camera, QrCode, Truck, Shield, UserPlus } from "lucide-react";
import "./SecurityDashboard.css";
const SecurityDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("live");
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [expectedVisitors, setExpectedVisitors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showForm, setShowForm] = useState(false);

const handleApprove = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user")); 

    await API.post(`/security/approve-request/${id}`, {
      approved_by: user.user_id
    });

    fetchSecurityData();

  } catch (err) {
    console.error("Approve error:", err);
  }
};

const handleReject = async (id) => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    await API.post(`/security/reject-request/${id}`, {
      approved_by: user.user_id
    });

    fetchSecurityData();

  } catch (err) {
    console.error("Reject error:", err);
  }
};
const handleCheckin = async (id) => {
  try {
    await API.post(`/security/checkin/${id}`);

    // 🔥 Move from Expected → Live
    const checkedInItem = expectedVisitors.find(
      req => (req.request_id) === id
    );

    if (checkedInItem) {
      // remove from expected
      setExpectedVisitors(prev =>
        prev.filter(req => (req.request_id) !== id)
      );

      // add to live
      setLiveVisitors(prev => [
        ...prev,
        {
          ...checkedInItem,
          status: "Inside",
          checkIn: new Date().toLocaleTimeString()
        }
      ]);
    }
      fetchSecurityData();

  } catch (err) {
    console.error("Checkin error:", err);
  }
};

const handleCheckout = async (id) => {
  try {
    await API.post(`/security/checkout/${id}`);

    const checkedOutItem = liveVisitors.find(
      v => (v.id || v.request_id) === id
    );

    if (checkedOutItem) {
      // remove from live
      setLiveVisitors(prev =>
        prev.filter(v => (v.id || v.request_id) !== id)
      );
    }
      fetchSecurityData();

  } catch (err) {
    console.error("Checkout error:", err);
  }
};

const handlePhotoUpload = async (e, request_id) => {
  const file = e.target.files[0];

  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("photo", file);

    await API.post(
      `/security/upload-photo/${request_id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert("✅ Photo Uploaded!");

    fetchSecurityData(); // refresh UI

  } catch (err) {
    console.error("Upload error:", err);
    alert("❌ Upload failed");
  }
};

const [stats, setStats] = useState({
  inside: 0,
  expected: 0,
  pending: 0,
  overstay: 0
});
const fetchSecurityData = async () => {
  try {
    // 🔥 CALL ALL APIs
    const [statsRes, liveRes, pendingRes, expectedRes, activityRes] = await Promise.all([
      API.get("/security/dashboard"),
      API.get("/security/live-visitors"),
      API.get("/security/pending-requests"),
      API.get("/security/expected-visitors"),
      API.get("/security/recent-activity")
    ]);

    // 🔥 SET DATA
    setStats({
      inside: statsRes.data.visitors_inside,
      expected: statsRes.data.expected_today,
      pending: statsRes.data.pending_approval,
      overstay: statsRes.data.overstay_alerts
    });

    setLiveVisitors(liveRes.data);
    setPendingRequests(pendingRes.data);
    setExpectedVisitors(expectedRes.data);
    setRecentActivity(activityRes.data);

  } catch (err) {
    console.error("Security API error:", err);
  }
};
useEffect(() => {
  fetchSecurityData();
const interval = setInterval(fetchSecurityData, 5000); // every 5 sec
return () => clearInterval(interval);
}, []);


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
      <div className="security-main-content">
          <div className="security-page-header">
             <div>
              <h1 className="security-title">Security Dashboard</h1>
              <p className="security-subtitle">
                Monitor visitors, manage check-ins, and handle spot requests
              </p>
            </div>

            <div className="security-header-actions">
              <button className="security-btn-primary" style={{ backgroundColor: '#ef4444' }}>
                <Shield size={16} /> Emergency Muster
              </button>

              <button
                className="security-btn-primary"
                onClick={() => setShowForm(true)}
              >
                <UserPlus size={16} /> Add Employee
              </button>

              <button className="security-btn-primary">
                <QrCode size={16} /> Scan QR
              </button>
            </div>

          </div>
        {showForm && (
            <div className="modal-overlay">
            <div className="modal-content-wrapper"> 
                <VisitorPassForm
                  onClose={() => {
                    setShowForm(false);
                    fetchSecurityData();
                  }}
                />
              </div>
            </div>
          )}
        <div className="security-stats-grid">
          <StatCard label="Visitors Inside" value={stats.inside} icon={<Users size={22} />} iconBg="hsl(217, 91%, 60%, 0.1)" iconColor="hsl(217, 91%, 60%)" />
          <StatCard label="Expected Today" value={stats.expected} icon={<UserCheck size={22} />} iconBg="hsl(152, 81%, 90%)" iconColor="hsl(164, 86%, 20%)" />
          <StatCard label="Pending Approval" value={stats.pending} icon={<Clock size={22} />} iconBg="hsl(48, 96%, 89%)" iconColor="hsl(26, 90%, 31%)" />
          <StatCard label="Overstay Alerts" value={stats.overstay} icon={<AlertTriangle size={22} />} iconBg="hsl(0, 93%, 94%)" iconColor="hsl(0, 72%, 51%)" />
        </div>
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
                      {liveVisitors.filter(v => (v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||  String(v.request_id).toLowerCase().includes(searchQuery.toLowerCase())).map(v => (
                        <tr key={v.request_id}>
                          <td>
                            <div className="security-visitor-cell">
                              <div className="avatar-wrapper">
                                  
                                  {/* Avatar */}
                                  <div className="avatar-circle">
                                    {v.photo ? (
                                      <img
                                        src={`http://localhost:5000/${v.photo}`}
                                        alt="visitor"
                                        className="avatar-image"
                                      />
                                    ) : (
                                      (v.name || "user").split(" ").map(n => n[0]).join("")
                                    )}
                                  </div>

                                  {/* Camera Icon */}
                                  <div
                                    className="camera-icon"
                                    onClick={() => document.getElementById(`camera-${v.request_id}`).click()}
                                  >
                                    <Camera size={12} color="white" />
                                  </div>

                                  {/* Hidden Input */}
                                  <input
                                    id={`camera-${v.request_id}`}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden-input"
                                    onChange={(e) => handlePhotoUpload(e, v.request_id)}
                                  />

                                </div>
                              
                              <div>
                                <div className="security-visitor-name">{v.name}</div>
                                <div className="security-visitor-company">{v.company && v.purpose ? `${v.company} · ${v.purpose}` : ""}</div>
                              </div>
                            </div>
                          </td>
                          <td>{v.host}</td>
                          <td><span className="security-badge-tag">{ v.request_id}</span></td>
                          <td>{v.checkIn}</td>
                          <td>
                            <span className={`security-status ${getStatusClass(v.status)}`}>
                              <span className="security-status-dot" /> {v.status}
                            </span>
                          </td>
                          <td>
                            <div className="security-action-btns">
                              {v.status !== "Checked Out" && (
                                <button
                                onClick={() => handleCheckout(v.id || v.request_id)}
                                className="security-checkout-btn">
                                Check Out
                              </button>
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
                    <div key={req.request_id} className="security-request-item">
                      <div className="security-request-info">
                        <div className="security-visitor-avatar">{(req.name || "user").split(" ").map(n => n[0]).join("")}</div>
                        <div>
                          <h4>{req.name}</h4>
                          <div className="security-request-meta">
                            <span>{req.company}</span> · <span>{req.purpose}</span> · <span>Host: {req.host}</span>
                          </div>
                          <span className="security-time-tag">{req.time}</span>
                        </div>
                      </div>
                      <div className="security-request-actions">
                        <button onClick={() => handleReject(req.request_id || req.id)} className="security-reject-btn">
                         Reject
                        </button>
                        <button onClick={() => handleApprove(req.request_id || req.id)} className="security-approve-btn">
                          Approve
                       </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeView === "expected" && (
                <div className="security-requests-list">
                 {expectedVisitors.map(req => {

                    return (
                      <div key={req.request_id} className="security-request-item">
                        <div className="security-request-info">
                          <div className="security-visitor-avatar">
                            {(req.name || "User").split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <h4>{req.name}</h4>
                            <div className="security-request-meta">
                              <span>{req.company}</span> · <span>{req.purpose}</span> · <span>Host: {req.host}</span>
                            </div>
                            <span className="security-time-tag">Expected at {req.time}</span>
                          </div>
                        </div>

                        <div className="security-request-actions">
                          <button
                            onClick={() => handleCheckin(req.request_id || req.id)} // ✅ FIX HERE
                            className="security-approve-btn"
                          >
                            <CheckCircle size={16} /> Check In
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
                          {liveVisitors.filter(v =>
                            (v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(v.request_id).toLowerCase().includes(searchQuery.toLowerCase())
                          ).map(v => (
                            <tr key={v.request_id}>
                              <td>
                                <div className="security-visitor-cell">
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
  
                                      {/* Avatar */}
                                      <div className="security-visitor-avatar">
                                        {v.photo ? (
                                          <img
                                            src={`http://localhost:5000/${v.photo}`}
                                            alt="visitor"
                                            style={{ width: 40, height: 40, borderRadius: "50%" }}
                                          />
                                        ) : (
                                          (v.name || "user").split(" ").map(n => n[0]).join("")
                                        )}
                                      </div>

                                      {/* Upload Button */}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        style={{ marginTop: "5px", fontSize: "10px" }}
                                        onChange={(e) => handlePhotoUpload(e, v.request_id)}
                                      />
                                    </div>
                                  <div>
                                    <div className="security-visitor-name">{v.name}</div>
                                    <div className="security-visitor-company">{v.company}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{v.host}</td>
                              <td><span className="security-badge-tag">{ v.request_id}</span></td>
                              <td>
                                <span className={`security-status ${getStatusClass(v.status)}`}>
                                  <span className="security-status-dot" /> {v.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {liveVisitors.filter(v =>
                              (v.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              String(v.request_id).toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 && (
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