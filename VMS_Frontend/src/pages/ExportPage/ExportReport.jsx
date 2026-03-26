  import { useState, useEffect } from "react";
  import { motion, AnimatePresence } from "framer-motion";
  import html2pdf from "html2pdf.js";
  import {
    X, Download, Calendar, Users, UserCheck, UserX, TrendingUp,
    FileText, Filter, Clock, ArrowUpRight, ArrowDownRight,
    Repeat, Building2, HardHat, UserRound, Truck,
    Timer, MapPin, BarChart3, PieChart as PieIcon, FileSpreadsheet
  } from "lucide-react";
  import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
  } from "recharts";
  import axios from "axios";
  import "./ExportReport.css";

  const PERIOD_OPTIONS = [
    { value: "daily", label: "Today", icon: "📅" },
    { value: "weekly", label: "This Week", icon: "📆" },
    { value: "quarterly", label: "This Quarter", icon: "🗓️" },
    { value: "yearly", label: "This Year", icon: "📊" },
  ];

  const PIE_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#f59e0b", "#ef4444", "#10b981", "#f97316", "#6366f1"];
  const ExportReport = () => {
    const [period, setPeriod] = useState("daily");
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

  useEffect(() => {
  fetchReport(period); 
}, [period]);

  const fetchReport = async (selectedPeriod) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/reports?period=${selectedPeriod}`);
      setReportData(res.data);
    } catch (error) {
      console.log("API failed → using demo data");
      setReportData(DEMO_DATA[selectedPeriod]); // ✅ fallback
    } finally {
      setLoading(false);
    }
  };

const handleDownloadPDF = () => {
  const printContent = document.querySelector(".report-body").innerHTML;

  const newWindow = window.open("", "_blank");

  newWindow.document.write(`
    <html>
      <head>
        <title>Report Preview</title>
        <style>
          body { font-family: Arial; padding: 20px; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.focus();

  // 👉 This opens preview (user can choose Save as PDF)
  newWindow.print();
};
   const handleExportExcel = async () => {
  const response = await axios.get("http://localhost:5000/api/reports/export-excel", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Visitor_Report.xlsx");

  document.body.appendChild(link);
  link.click();
  link.remove();
};

    const formatDateTime = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
    };

    const formatDate = () => {
      const now = new Date();
      return now.toLocaleDateString("en-IN", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
      });
    };

    if (!reportData) return <div>Loading report...</div>;

    const summary = reportData?.summary || DEMO_DATA[period].summary;
    const trend = reportData?.trend || DEMO_DATA[period].trend;
    const categorySplit = reportData?.categorySplit || DEMO_DATA[period].categorySplit;
    const advancedInsights = reportData?.advancedInsights || DEMO_DATA[period].advancedInsights;
    const visitors = reportData?.visitors || [];

    return (
      <AnimatePresence>
        {true && (
          <motion.div
            className="report-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="report-modal"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Header */}
              <div className="report-header no-print-hide">
                <div className="report-header-left">
                  <div className="report-header-icon">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="report-title">Management Reporting Dashboard</h2>
                    <p className="report-date">
                      <Calendar size={14} /> {formatDate()} | Strategic Insights Report
                    </p>
                  </div>
                </div>
                <div className="report-header-right no-print">
                  <div className="report-period-selector">
                    <Filter size={16} />
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className={`report-period-btn ${period === opt.value ? "active" : ""}`}
                        onClick={() => setPeriod(opt.value)}
                      >
                        <span className="report-period-icon">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <button className="report-download-btn excel-btn" onClick={handleExportExcel}>
                    <FileSpreadsheet size={16} /> Export to Excel
                  </button>
                  <button className="report-download-btn" onClick={handleDownloadPDF}>
                    <Download size={16} /> Export to PDF
                  </button>
                  <button 
                    className="report-close-btn" 
                    onClick={() => window.history.back()}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Print-only header */}
              <div className="print-only-header">
                <h1>Visitor Management System — Strategic Performance Report</h1>
                <p>Reporting Period: {PERIOD_OPTIONS.find(o => o.value === period)?.label} &nbsp;|&nbsp; Generated: {formatDate()}</p>
              </div>

              {loading ? (
                <div className="report-loading">
                  <div className="report-spinner" />
                  <p>Analyzing data & generating insights...</p>
                </div>
              ) : (
                <div className="report-body">
                  {/* 1. MANAGEMENT DASHBOARD (KPIs) */}
                  <h3 className="report-group-title">1. MANAGEMENT DASHBOARD (Key Performance Indicators)</h3>
                  <div className="report-summary-grid extended">
                    <div className="report-stat-card total">
                      <div className="report-stat-icon"><Users size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Total Visitors (Today)</span>
                        <span className="report-stat-value">{summary.todayCount?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="report-stat-card total">
                      <div className="report-stat-icon"><Calendar size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Total Visitors (MTD)</span>
                        <span className="report-stat-value">{summary.mtdCount?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="report-stat-card total">
                      <div className="report-stat-icon"><TrendingUp size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Total Visitors (YTD)</span>
                        <span className="report-stat-value">{summary.ytdCount?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="report-stat-card neutral">
                      <div className="report-stat-icon"><UserRound size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Avg Daily Visitors</span>
                        <span className="report-stat-value">{summary.avgDaily}</span>
                      </div>
                    </div>
                    <div className="report-stat-card info">
                      <div className="report-stat-icon"><Clock size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Peak Hour</span>
                        <span className="report-stat-value">{summary.peakHour}</span>
                      </div>
                    </div>
                    <div className="report-stat-card success">
                      <div className="report-stat-icon"><Repeat size={20} /></div>
                      <div className="report-stat-info">
                        <span className="report-stat-label">Repeat Visitors %</span>
                        <span className="report-stat-value">{summary.repeatPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. GRAPHS SECTION */}
                  <h3 className="report-group-title">2. VISUAL ANALYTICS</h3>
                  <div className="report-charts-grid full-width">
                    <div className="report-chart-card">
                      <h3 className="report-chart-title"><TrendingUp size={18} /> Visitor Traffic Trend</h3>
                      <div className="report-chart-body">
                        <ResponsiveContainer width="100%" height={280}>
                          <AreaChart data={trend}>
                            <defs>
                              <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#627d98" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#627d98" }} />
                            <Tooltip contentStyle={{ borderRadius: "0.75rem", background: "rgba(255,255,255,0.95)" }} />
                            <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={2.5} fill="url(#reportGradient)" dot={{ r: 4, fill: "#2563eb" }} />
                          </AreaChart>
                        </ResponsiveContainer>
                        <p className="chart-insight-caption">Shows business growth/decline patterns over the selected period.</p>
                      </div>
                    </div>
                  </div>

                  <div className="report-charts-grid">
                    <div className="report-chart-card">
                      <h3 className="report-chart-title"><PieIcon size={18} /> Visitor Category Split</h3>
                      <div className="report-chart-body">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie 
                              data={categorySplit} cx="50%" cy="50%" innerRadius={60} 
                              outerRadius={80} paddingAngle={5} dataKey="value"
                            >
                              {categorySplit.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Legend iconType="circle" wrapperStyle={{ fontSize: "0.75rem" }} />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <p className="chart-insight-caption">Business activity pattern breakdown by visitor type.</p>
                      </div>
                    </div>
                    </div>

                  {/* 3. ADVANCED INSIGHTS */}
                  <h3 className="report-group-title">3. STRATEGIC INSIGHTS (Advanced Analytics)</h3>
                  <div className="advanced-insights-grid">
                    <div className="insight-card">
                      <h4><Building2 size={16} /> Top Departments</h4>
                      <ul className="insight-list">
                        {advancedInsights.topDepartments.map((dept, i) => (
                          <li key={i}><span>{dept.name}</span><strong>{dept.count}</strong></li>
                        ))}
                      </ul>
                    </div>
                    <div className="insight-card">
                      <h4><HardHat size={16} /> Top Vendors Visiting</h4>
                      <ul className="insight-list">
                        {advancedInsights.topVendors.map((vendor, i) => (
                          <li key={i}><span>{vendor.name}</span><strong>{vendor.count}</strong></li>
                        ))}
                      </ul>
                    </div>
                    <div className="insight-card">
                      <h4><Timer size={16} /> Visit Behavior</h4>
                      <div className="insight-metric">
                        <span className="metric-label">Avg Visit Duration</span>
                        <span className="metric-value">{advancedInsights.avgDuration} mins</span>
                      </div>
                      <div className="insight-metric">
                        <span className="metric-label">Repeat Visitor Ratio</span>
                        <span className="metric-value">{advancedInsights.repeatRatio}x</span>
                      </div>
                    </div>
                    <div className="insight-card">
                      <h4><MapPin size={16} /> Gate-wise Traffic</h4>
                      <ul className="insight-list">
                        {advancedInsights.gateTraffic.map((gate, i) => (
                          <li key={i}><span>{gate.name}</span><strong>{gate.count}</strong></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="report-table-section page-break-before">
                    <h3 className="report-section-title">
                      <Users size={18} /> Detailed Visitor Log Activity
                      <span className="report-record-count">{visitors.length} Audit Records</span>
                    </h3>
                    {visitors.length > 0 ? (
                      <div className="report-table-wrapper">
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>Visitor Details</th>
                              <th>Host/Dept</th>
                              <th>Category</th>
                              <th>Check In/Out</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visitors.map((v, i) => (
                              <tr key={v.visitor_id || i}>
                                <td className="report-name-cell">
                                  <div className="report-avatar">
                                    {v.name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="name">{v.name}</div>
                                    <div className="sub">{v.email || v.phone}</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="host">{v.host_name || "—"}</div>
                                  <div className="dept">{v.department || "General"}</div>
                                </td>
                                <td><span className="report-category-badge">{v.category || "General"}</span></td>
                                <td>
                                  <div className="time-in">In: {formatDateTime(v.check_in)}</div>
                                  <div className="time-out">Out: {formatDateTime(v.check_out)}</div>
                                </td>
                                <td>
                                  <span className={`report-status ${v.status === "checked_in" ? "in" : "out"}`}>
                                    {v.status?.replace('_', ' ')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="report-empty-table">
                        <Users size={40} />
                        <p>Full audit logs available in CSV/Excel export.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  export default ExportReport;
