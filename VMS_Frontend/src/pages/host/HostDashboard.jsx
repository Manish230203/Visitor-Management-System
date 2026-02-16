import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Clock, CheckCircle, Calendar, Bell, 
  MoreVertical, LogOut, ShieldAlert, Plus, X 
} from 'lucide-react';

import './HostDashboard.css';

// Import the form component
import VisitorPassForm from '../../components/forms/VisitorPassForm'; 

// --- Dynamic Mock Data Sets ---

// Traffic Data
const trafficDataSets = {
  Daily: [
    { name: '09:00', visitors: 2 }, { name: '11:00', visitors: 8 }, 
    { name: '13:00', visitors: 4 }, { name: '15:00', visitors: 9 }, 
    { name: '17:00', visitors: 3 }
  ],
  Weekly: [
    { name: 'Mon', visitors: 12 }, { name: 'Tue', visitors: 19 }, 
    { name: 'Wed', visitors: 15 }, { name: 'Thu', visitors: 22 }, 
    { name: 'Fri', visitors: 28 }, { name: 'Sat', visitors: 5 },
  ],
  Monthly: [
    { name: 'Week 1', visitors: 45 }, { name: 'Week 2', visitors: 52 }, 
    { name: 'Week 3', visitors: 48 }, { name: 'Week 4', visitors: 60 },
  ],
  Quarterly: [
    { name: 'Jan', visitors: 150 }, { name: 'Feb', visitors: 180 }, 
    { name: 'Mar', visitors: 145 }
  ],
  Yearly: [
    { name: 'Jan', visitors: 150 }, { name: 'Feb', visitors: 180 }, 
    { name: 'Mar', visitors: 145 }, { name: 'Apr', visitors: 165 },
    { name: 'May', visitors: 190 }, { name: 'Jun', visitors: 165 },
    { name: 'Jul', visitors: 175 }, { name: 'Aug', visitors: 155 },
    { name: 'Sep', visitors: 160 }, { name: 'Oct', visitors: 210 },
    { name: 'Nov', visitors: 185 }, { name: 'Dec', visitors: 185 }
  ]
};

// Purpose Data (Actual Numbers)
const purposeDataSets = {
  Daily: [
    { name: 'Meeting', value: 12, color: '#2563EB' }, { name: 'Interview', value: 8, color: '#10B981' },
    { name: 'Delivery', value: 4, color: '#F59E0B' }, { name: 'Maintenance', value: 2, color: '#6366F1' },
  ],
  Weekly: [
    { name: 'Meeting', value: 45, color: '#2563EB' }, { name: 'Interview', value: 25, color: '#10B981' },
    { name: 'Delivery', value: 15, color: '#F59E0B' }, { name: 'Maintenance', value: 16, color: '#6366F1' },
  ],
  Monthly: [
    { name: 'Meeting', value: 110, color: '#2563EB' }, { name: 'Interview', value: 50, color: '#10B981' },
    { name: 'Delivery', value: 25, color: '#F59E0B' }, { name: 'Maintenance', value: 20, color: '#6366F1' },
  ],
  Quarterly: [
    { name: 'Meeting', value: 250, color: '#2563EB' }, { name: 'Interview', value: 120, color: '#10B981' },
    { name: 'Delivery', value: 65, color: '#F59E0B' }, { name: 'Maintenance', value: 40, color: '#6366F1' },
  ],
  Yearly: [
    { name: 'Meeting', value: 1050, color: '#2563EB' }, { name: 'Interview', value: 450, color: '#10B981' },
    { name: 'Delivery', value: 300, color: '#F59E0B' }, { name: 'Maintenance', value: 265, color: '#6366F1' },
  ]
};

const initialRequests = [
  { id: 101, name: "Amit Sharma", company: "XYZ Pvt Ltd", type: "Vendor", purpose: "Maintenance", time: "10:30 AM" },
  { id: 102, name: "Sarah Jenkins", company: "Global Tech", type: "Guest", purpose: "Meeting", time: "02:00 PM" },
];

const upcomingVisits = [
  { id: 201, name: "Rahul Verma", company: "Consultant", purpose: "Audit", date: "Jan 31", time: "11:00 AM", status: "Approved" },
  { id: 202, name: "Priya Singh", company: "Intern", purpose: "Interview", date: "Feb 01", time: "09:30 AM", status: "Approved" },
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, subText }) => (
  <div className="stat-card">
    <div className="stat-content">
      <div>
        <p className="stat-label">{title}</p>
        <h3 className="stat-value">{value}</h3>
        {subText && <p className="subtitle" style={{fontSize: '0.75rem'}}>{subText}</p>}
      </div>
      <div className="stat-icon-box" style={{ backgroundColor: colorClass, color: 'white' }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{label}</p>
        <p style={{ color: '#2563eb', margin: 0 }}>Visitors: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function HostDashboard() {
  const [requests, setRequests] = useState(initialRequests);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Weekly');
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (id, action) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    console.log(`Request ${id} ${action}`);
  };

  const getTotalVisitors = () => {
    return purposeDataSets[timeFilter].reduce((total, item) => total + item.value, 0);
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="dashboard-container">
      
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-section">
            <div className="logo-icon-box">
              <ShieldAlert size={24} />
            </div>
            <span className="brand-name">
              Visitor<span className="text-blue">Management</span>
            </span>
          </div>
          
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>
              <Calendar size={16} />
              <span>{formattedDate} | {formattedTime}</span>
            </div>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#64748b" />
              <span className="dot" style={{ position: 'absolute', top: -2, right: -2, backgroundColor: 'red' }}></span>
            </div>
            <div className="user-profile">
              <div className="avatar">MK</div>
              <div style={{ display: 'none', flexDirection: 'column', gap: '2px' }} className="sm-block">
                <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Manish K.</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        
        {/* Header */}
        <div className="page-header">
          <div className="header-title">
            <h1>Dashboard Overview</h1>
            <p className="subtitle">Manage visitor approvals and tracking.</p>
          </div>
          
          <button 
            className="btn-primary" 
            onClick={() => setShowInviteForm(true)}
          >
            <Plus size={18} /> New Invite
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <StatCard title="Total Visitors" value="128" icon={Users} colorClass="#2563EB" subText="+12% vs last week" />
          <StatCard title="On Premises" value="8" icon={CheckCircle} colorClass="#10B981" subText="Currently active" />
          <StatCard title="Pending" value={requests.length} icon={Clock} colorClass="#F59E0B" subText="Requires action" />
          <StatCard title="Avg Duration" value="42m" icon={Calendar} colorClass="#6366F1" subText="Per visit" />
        </div>

        {/* Main Grid */}
        <div className="dashboard-grid">
          
          {/* Left Column */}
          <div className="left-column">
            
            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="card">
                <div className="card-header" style={{ backgroundColor: '#fff7ed' }}>
                  <h3 className="card-title" style={{ color: '#9a3412' }}>
                    <ShieldAlert size={18} /> Pending Approvals
                  </h3>
                  <span className="tag" style={{ backgroundColor: '#ffedd5', color: '#9a3412', fontWeight: 'bold' }}>
                    {requests.length} New
                  </span>
                </div>
                <div>
                  {requests.map((req) => (
                    <div key={req.id} className="request-item">
                      <div className="visitor-info">
                        <div className="visitor-avatar">{req.name.charAt(0)}</div>
                        <div className="visitor-details">
                          <h4>{req.name}</h4>
                          <div className="meta-tags">
                            <span>{req.company}</span>
                            <span>•</span>
                            <span className="tag">{req.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="btn-reject"
                          onClick={() => handleAction(req.id, 'Rejected')}
                        >
                          Reject
                        </button>
                        <button 
                          className="btn-approve"
                          onClick={() => handleAction(req.id, 'Approved')}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Traffic Chart */}
            <div className="card">
              <div className="card-header" style={{ alignItems: 'center' }}>
                <h3 className="card-title">Visitor Analytics</h3>
                
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div style={{ padding: '1.5rem', minWidth: 0 }}>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    {['Daily', 'Weekly'].includes(timeFilter) ? (
                      <BarChart data={trafficDataSets[timeFilter]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="visitors" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} animationDuration={500} />
                      </BarChart>
                    ) : (
                      <LineChart data={trafficDataSets[timeFilter]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: 'white', stroke: '#2563eb', strokeWidth: 2}} animationDuration={500} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Upcoming List */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Upcoming Visits</h3>
                <button className="text-link">View All</button>
              </div>
              <div className="table-container">
                <table className="visits-table">
                  <thead>
                    <tr>
                      <th>Visitor</th>
                      <th>Purpose</th>
                      <th>Schedule</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td>
                          <div style={{fontWeight: 600}}>{visit.name}</div>
                          <div style={{fontSize: '0.75rem', color: '#64748b'}}>{visit.company}</div>
                        </td>
                        <td><span className="tag">{visit.purpose}</span></td>
                        <td>
                          <div>{visit.date}</div>
                          <div style={{fontSize: '0.75rem', color: '#64748b'}}>{visit.time}</div>
                        </td>
                        <td>
                          <span className="status-badge approved">
                            <span className="dot"></span> {visit.status}
                          </span>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <MoreVertical size={16} color="#94a3b8" style={{cursor: 'pointer'}} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            
            {/* Pie Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Visit Purpose</h3>
                <span className="tag" style={{fontSize: '0.7rem'}}>{timeFilter}</span>
              </div>
              <div style={{ padding: '1.5rem', position: 'relative', minWidth: 0 }}>
                <div style={{ height: '200px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purposeDataSets[timeFilter]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={500}
                      >
                        {purposeDataSets[timeFilter].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '20px' }}>{getTotalVisitors()}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Total</span>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {purposeDataSets[timeFilter].map((item) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></span>
                        <span style={{ color: '#475569' }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Host Actions Widget */}
            <div className="host-actions-card">
              <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} /> Host Actions
              </h3>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5 }}>
                Compliance Check: Ensure all vendors have submitted insurance documents.
              </p>
              
              <div className="action-btn-group">
                <button className="glass-btn">
                  <Calendar size={20} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Sync Calendar</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Import meetings</div>
                  </div>
                </button>
                <button className="glass-btn">
                  <LogOut size={20} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Evacuation Log</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Emergency protocols</div>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* --- Modal Render Logic --- */}
      {showInviteForm && (
        <div className="modal-overlay">
          <div className="modal-content-wrapper">
            <button 
              className="close-modal-btn" 
              onClick={() => setShowInviteForm(false)}
            >
              <X size={24} color="#64748b" />
            </button>
            <VisitorPassForm onSuccess={() => setShowInviteForm(false)} />
          </div>
        </div>
      )}

    </div>
  );
}