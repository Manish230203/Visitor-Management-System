import React, { useState, useEffect } from 'react';
import logo from "../../assets/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Clock, CheckCircle, Calendar, Bell, 
  MoreVertical, LogOut, ShieldAlert, Plus, X 
} from 'lucide-react';

import './HostDashboard.css';
import VisitorPassForm from '../../components/forms/VisitorPassForm'; 
import API from "../../app/apiClient";

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
  const [requests, setRequests] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Daily');
  const [purposeData, setPurposeData] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingVisits, setUpcomingVisits] = useState([]);

  const [stats, setStats] = useState({
  totalVisitors: 0,
  onPremises: 0,
  avgDuration: 0
});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get(`/reports?period=${timeFilter.toLowerCase()}`);
      if (res.data && res.data.trend) {
        setChartData(res.data.trend);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

const fetchRequests = async () => {
  try {
    const res = await API.get("/visitor-requests");

    const all = res.data;

    const pending = all.filter(r => r.status === "PENDING");
    const approved = all.filter(r => r.status === "APPROVED");

    setRequests(pending);
    setUpcomingVisits(approved);

const onPremises = all.filter(
  r => r.check_in_time && !r.check_out_time
).length;

setStats({
  totalVisitors: all.length,
  onPremises: onPremises,
  avgDuration: 42
});
const purposeCount = {};

all.forEach(item => {
  const purpose = item.purpose || "Other";

  if (!purposeCount[purpose]) {
    purposeCount[purpose] = 0;
  }

  purposeCount[purpose]++;
});

// convert to chart format
const formattedPurpose = Object.keys(purposeCount).map((key, index) => {
  const colors = ['#2563EB', '#10B981', '#F59E0B', '#6366F1'];

  return {
    name: key,
    value: purposeCount[key],
    color: colors[index % colors.length]
  };
});

setPurposeData(formattedPurpose);

  } catch (err) {
    console.error("Error fetching:", err);
  }
};

const handleAction = async (id, action) => {
  try {
    if (action === "APPROVED") {
      await API.put(`/visitor-requests/${id}/approve`, {
        approved_by: 1
      });
    } else {
      await API.put(`/visitor-requests/${id}/reject`, {
        approved_by: 1
      });
    }

    fetchRequests();

  } catch (err) {
    console.error(err);
  }
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
  <>
       <Navbar role="host" userName="Manish K." />
       <div className="dashboard-container">

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
          <StatCard title="Total Visitors" value={stats.totalVisitors} icon={Users} colorClass="#2563EB" subText="+12% vs last week" />
          <StatCard title="On Premises" value={stats.onPremises} icon={CheckCircle} colorClass="#10B981" subText="Currently active" />
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
                   <div key={req.request_id} className="request-item">
                      <div className="visitor-info">
                       <div className="visitor-avatar">{req.visitor_name?.charAt(0)}</div>
                        <div className="visitor-details">
                          <h4>{req.visitor_name}</h4>
                          <div className="meta-tags">
                            <span>{req.company_name}</span>
                            <span>•</span>
                            <span className="tag">{req.purpose}</span>
                          </div>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="btn-reject"
                          onClick={() => handleAction(req.request_id, 'REJECTED')}
                        >
                          Reject
                        </button>
                        <button 
                          className="btn-approve"
                          onClick={() => handleAction(req.request_id, 'APPROVED')}
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
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                        <Bar dataKey="visitors" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} animationDuration={500} />
                      </BarChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
    <tr key={visit.request_id}>
      <td>
        <div style={{fontWeight: 600}}>{visit.visitor_name}</div>
        <div style={{fontSize: '0.75rem', color: '#64748b'}}>
          {visit.company_name}
        </div>
      </td>
      <td><span className="tag">{visit.purpose}</span></td>
      <td>
        <div>{visit.scheduled_date}</div>
        <div style={{fontSize: '0.75rem', color: '#64748b'}}>
          {visit.scheduled_time}
        </div>
      </td>
      <td>
        <span className="status-badge approved">
          <span className="dot"></span> {visit.status}
        </span>
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
              <div style={{ padding: '1.5rem' }}>
                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={purposeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={500}
                      >
                        {purposeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-chart-total">
                    <span className="total-number">{purposeData.reduce((sum, item) => sum + item.value, 0)  }</span>
                    <span className="total-label">Total</span>
                  </div>
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {purposeData.map((item) =>(
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
           <VisitorPassForm 
            onClose={() => {
            setShowInviteForm(false);
            fetchRequests(); 
            }} 
          />
          </div>
        </div>
      )}

    </div>
    </>
  );
}