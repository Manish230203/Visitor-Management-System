import { useState, useRef, useEffect } from "react";
import companyLogo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, User, Settings, LogOut, ChevronDown, Bell, CalendarClock } from "lucide-react";
import "./Navbar.css";

const roleLabels = {
  admin: "Admin",
  security: "Security",
  superadmin: "Super Admin",
};

const Navbar = ({ role, userName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <nav className="vms-navbar">
      <div className="vms-nav-content">
       <div 
            className="vms-logo-section" 
            onClick={() => navigate("/")} 
            style={{ cursor: "pointer" }}
          >

            {/* Your Logo */}
            <img 
              src={companyLogo} 
              alt="company logo"
              className="vms-navbar-logo"
            />

            {/* Company Name */}
            <span className="vms-brand-name">
              Unique Delta ForceSecurity Pvt. Ltd.
            </span>

            {/* Keep role badge (same UI) */}
            <span className="vms-role-badge">
              {roleLabels[role]}
            </span>

          </div>

        <div className="vms-nav-datetime" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem', fontWeight: '500', background: 'hsl(var(--muted))', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}>
          <CalendarClock size={16} />
          <span>{formatDate(currentTime)} • {formatTime(currentTime)}</span>
        </div>

        <div className="vms-nav-actions">
          <button className="vms-notification-btn" title="Notifications">
            <Bell size={20} />
            <span className="vms-notification-dot" />
          </button>

          <div className="vms-user-profile-wrapper" ref={dropdownRef}>
            <div className="vms-user-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="vms-avatar">{initials}</div>
              <div className="vms-user-info-text">
                <span className="vms-user-name">{userName}</span>
                <span className="vms-user-role">{roleLabels[role]}</span>
              </div>
              <span className={`vms-chevron ${dropdownOpen ? "open" : ""}`}>
                <ChevronDown size={16} />
              </span>
            </div>

            {dropdownOpen && (
              <div className="vms-profile-dropdown">
                <div className="vms-dropdown-header">{userName}</div>
                <button className="vms-dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                  <User size={16} /> Profile
                </button>
                <button className="vms-dropdown-item" onClick={() => { setDropdownOpen(false); }}>
                  <Settings size={16} /> Settings
                </button>
                <div className="vms-dropdown-divider" />
                {role === "admin" && (
                  <>
                    <div className="vms-dropdown-label">Switch Dashboard</div>
                    {/* {location.pathname !== "/admin" && (
                      <button className="vms-dropdown-item" onClick={() => { navigate("/admin/dashboard/"); setDropdownOpen(false); }}>
                        <Shield size={16} /> Admin Dashboard
                      </button>
                    )} */}
                    {location.pathname !== "/host" && (
                      <button className="vms-dropdown-item" onClick={() => { navigate("/host/dashboard/"); setDropdownOpen(false); }}>
                        <Shield size={16} /> Host Dashboard
                      </button>
                    )}
                    {location.pathname !== "/security" && (
                      <button className="vms-dropdown-item" onClick={() => { navigate("/security/dashboard/"); setDropdownOpen(false); }}>
                        <Shield size={16} /> Security Dashboard
                      </button>
                    )}
                    {location.pathname !== "/superadmin" && (
                      <button className="vms-dropdown-item" onClick={() => { navigate("/superadmin/dashboard/"); setDropdownOpen(false); }}>
                        <Shield size={16} /> Super Admin Dashboard
                      </button>
                    )}
                    <div className="vms-dropdown-divider" />
                  </>
                )}
                <button className="vms-dropdown-item vms-logout-item" onClick={() => { navigate("/"); setDropdownOpen(false); }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;