import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Hash,
  Save,
  ClipboardList,
  X,
  ShieldCheck
} from "lucide-react";
import "./VisitorPassForm.css";

export default function EmployeeRegistrationForm({ onClose }) {
  const [formData, setFormData] = useState({
    employeeID: "",
    name: "",
    email: "",
    phone: "",
    pabx: "",
    unit: "",
    department: "",
    location: "",
    accessLevel: "",
    reasonOfVisit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("User/Visitor Added Successfully!");
    
    // Trigger the close action if provided
    if (onClose) onClose();
  };

  return (
    <div className="form-container">
      {/* HEADER */}
      <div className="form-header">
        <h2>
          <User /> Visitor Registration
        </h2>

        {/* CLOSE BUTTON */}
        <button
          type="button"
          className="close-modal-btn"
          onClick={() => {
            if (onClose) onClose();
          }}
          style={{ position: 'relative', top: '0', right: '0', background: 'white' }}
        >
          <X size={22} color="#64748b" />
        </button>
      </div>

      {/* FORM */}
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* Employee ID */}
          <div className="form-group">
            <label>Employee ID <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Hash size={18} style={iconStyle} />
              <input
                type="text"
                name="employeeID"
                required
                placeholder="e.g. EMP-1001"
                style={inputStyle}
                value={formData.employeeID}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name <span>*</span></label>
            <div style={{ position: "relative" }}>
              <User size={18} style={iconStyle} />
              <input
                type="text"
                name="name"
                required
                placeholder="Enter full name"
                style={inputStyle}
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group full-width">
            <label>Email ID <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                name="email"
                required
                placeholder="employee@company.com"
                style={inputStyle}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label>Phone Number <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={iconStyle} />
              <input
                type="tel"
                name="phone"
                required
                // placeholder="+91-9876543210"
                style={inputStyle}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PABX */}
          <div className="form-group">
            <label>PABX Phone Number</label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={iconStyle} />
              <input
                type="text"
                name="pabx"
                placeholder="Extension (e.g. 405)"
                style={inputStyle}
                value={formData.pabx}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Unit */}
          <div className="form-group">
            <label>Unit <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Building size={18} style={iconStyle} />
              <select
                name="unit"
                required
                style={inputStyle}
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">Select Unit</option>
                <option value="IT Services">IT Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div className="form-group">
            <label>Department <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} style={iconStyle} />
              <select
              
                type="text"
                name="department"
                required
                placeholder="e.g. Human Resources"
                style={inputStyle}
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Location - Left Column */}
          <div className="form-group">
            <label>Location <span>*</span></label>
            <div style={{ position: "relative" }}>
              <MapPin size={18} style={iconStyle} />
              <select
                name="location"
                required
                style={inputStyle}
                value={formData.location}
                onChange={handleChange}
              >
                <option value="">Select Location</option>
                <option value="PN_CORP_B">Pune Corporate</option>
                <option value="BLR_HQ">Bangalore HQ</option>
                <option value="MUM_WEST">Mumbai West</option>
              </select>
            </div>
          </div>

          {/* Access Level - Right Column */}
          <div className="form-group">
            <label>Access Level <span>*</span></label>
            <div style={{ position: "relative" }}>
              <ShieldCheck size={18} style={iconStyle} />
              <select
                name="accessLevel"
                required
                style={inputStyle}
                value={formData.accessLevel}
                onChange={handleChange}
              >
                <option value="">Select Access Level</option>
                <option value="1">Visitor (Level 1)</option>
                <option value="10">Vendor (Level 10)</option>
                <option value="50">Security (Level 50)</option>
                <option value="80">Host (Level 80)</option>
                <option value="99">Admin Override (Level 99)</option>
              </select>
            </div>
          </div>

          {/* Type of ID proof */}
          <div className="form-group ">
            <label>Type Of ID Proof<span>*</span></label>
            <div style={{ position: "relative" }}>
              <ClipboardList size={18} style={iconStyle} />
              <select
                name="typeOfIDProof"
                required
                style={inputStyle}
                value={formData.typeOfIDProof}
                onChange={handleChange}
              >
                <option value="">Select ID Proof</option>
                <option value="Aadhar Card">Aadhar Card</option>
                <option value="PAN Card">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voting Card">Voting Card</option>
                <option value="Passport">Passport</option>
              </select>
            </div>
          </div>

          {/* ID proof number */}
          <div className="form-group">
            <label>ID Proof NUmber <span>*</span></label>
            <div style={{ position: "relative" }}>
              {/* <Phone size={18} style={iconStyle} /> */}
              <input
                type="text"
                name="idProofNumber"
                required
                // placeholder="+91-9876543210"
                style={inputStyle}
                value={formData.idProofNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Reason - Full Width */}
          <div className="form-group full-width">
            <label>Reason of Visit <span>*</span></label>
            <div style={{ position: "relative" }}>
              <ClipboardList size={18} style={iconStyle} />
              <select
                name="reasonOfVisit"
                required
                style={inputStyle}
                value={formData.reasonOfVisit}
                onChange={handleChange}
              >
                <option value="">Select Reason</option>
                <option value="Meeting">Meeting</option>
                <option value="Interview">Interview</option>
                <option value="Delivery">Delivery</option>
                <option value="Training">Training</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Work">Work</option>
              </select>
            </div>
          </div>

        </div>

        <button type="submit" className="btn-submit">
          <Save size={18} style={{ marginRight: 8 }} />
          Add Visitor
        </button>
      </form>
    </div>
  );
}

/* Shared inline styles */
const iconStyle = {
  position: "absolute",
  left: "10px",
  top: "12px",
  color: "#94a3b8",
};

const inputStyle = {
  paddingLeft: "2.5rem",
  width: "100%",
  boxSizing: "border-box",
};