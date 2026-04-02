import "./StatCard.css";

const StatCard = ({ label, value, icon, iconBg, iconColor, trend }) => {
  return (
    <div className="vms-stat-card">
      <div className="vms-stat-content">
        <div>
          <p className="vms-stat-label">{label}</p>
          <p className="vms-stat-value">{value}</p>
          {trend && (
            <span className={`vms-stat-trend ${trend.positive ? "positive" : "negative"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        <div className="vms-stat-icon-box" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;