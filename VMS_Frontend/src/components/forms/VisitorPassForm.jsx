import React, { useState } from "react";
import API from "../../app/apiClient";

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
  ShieldCheck,
  Laptop
} from "lucide-react";
import "./VisitorPassForm.css";

export default function VisitorPassForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pabx: "",
    unit: "",
    department: "",
    location: "",
    accessLevel: "",
    typeOfIDProof: "",
    idProofNumber: "",
    reasonOfVisit: "",
    hasDevice: "No",
    deviceType: "",
    deviceMake: "",
    deviceSerialNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("user"));

  const payload = {
    visitor_name: formData.name,
    full_name: formData.name,
    email: formData.email,
    mobile_number: formData.phone,
    pabx: formData.pabx,
    unit: formData.unit,
    department: formData.department,
    location: formData.location,
    id_proof_type: formData.typeOfIDProof,
    id_proof_number: formData.idProofNumber,
    purpose: formData.reasonOfVisit,
    access_level: formData.accessLevel,
    host_id: user.user_id
  };

  try {
    console.log("Payload:", payload);

    const res = await API.post("/visitor-requests", payload);

    console.log("Response:", res.data);

    alert("✅ Visitor Invite Sent!");

    if (onClose) onClose(); // close modal

  } catch (error) {
    console.error("ERROR:", error);

    alert("❌ Failed to send invite"); // 🔥 IMPORTANT
  }
};
  // Unit options for editable dropdown
  const unitOptions = [
    "IT Services",
    "Manufacturing",
    "Logistics",
    "Corporate",
    "HR",
    "Finance",
    "Operations",
    "Sales",
    "Marketing"
  ];

  // Location options for editable dropdown
  const locationOptions = [
    "Pune Corporate",
    "Bangalore HQ",
    "Mumbai West",
    "Delhi NCR",
    "Chennai",
    "Hyderabad",
    "Kolkata"
  ];

  // Department options
  const departmentOptions = [
    "IT",
    "Human Resources",
    "Finance",
    "Operations",
    "Sales",
    "Marketing",
    "Legal",
    "Customer Support"
  ];

  return (
    <div className="form-container">
      {/* HEADER */}
      <div className="form-header">
        <h2>
          <User /> New Invite
        </h2>

        <button
          type="button"
          className="form-close-btn"
          onClick={() => {
            if (onClose) onClose();
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* FORM */}
      <form className="form-content" onSubmit={handleSubmit}>
        <div className="form-grid">

          {/* Full Name - Mandatory */}
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
          <div className="form-group">
            <label>Email ID</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                name="email"
                placeholder="employee@company.com"
                style={inputStyle}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone - Mandatory */}
          <div className="form-group">
            <label>Phone Number <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Phone size={18} style={iconStyle} />
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 9876543210"
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

          {/* Unit - Editable Dropdown */}
          <div className="form-group">
            <label>Unit</label>
            <div style={{ position: "relative" }}>
              <Building size={18} style={iconStyle} />
              <input
                type="text"
                name="unit"
                list="unit-options"
                placeholder="Select or type unit"
                style={inputStyle}
                value={formData.unit}
                onChange={handleChange}
              />
              <datalist id="unit-options">
                {unitOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Department */}
          <div className="form-group">
            <label>Department</label>
            <div style={{ position: "relative" }}>
              <Briefcase size={18} style={iconStyle} />
              <select
                name="department"
                style={inputStyle}
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                {departmentOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location - Editable Dropdown */}
          <div className="form-group">
            <label>Location</label>
            <div style={{ position: "relative" }}>
              <MapPin size={18} style={iconStyle} />
              <input
                type="text"
                name="location"
                list="location-options"
                placeholder="Select or type location"
                style={inputStyle}
                value={formData.location}
                onChange={handleChange}
              />
              <datalist id="location-options">
                {locationOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Access Level */}
          <div className="form-group">
            <label>Access Level</label>
            <div style={{ position: "relative" }}>
              <ShieldCheck size={18} style={iconStyle} />
              <select
                name="accessLevel"
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
          <div className="form-group">
            <label>Type Of ID Proof</label>
            <div style={{ position: "relative" }}>
              <ClipboardList size={18} style={iconStyle} />
              <select
                name="typeOfIDProof"
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
            <label>ID Proof Number</label>
            <div style={{ position: "relative" }}>
              <Hash size={18} style={iconStyle} />
              <input
                type="text"
                name="idProofNumber"
                placeholder="Enter ID proof number"
                style={inputStyle}
                value={formData.idProofNumber}
                onChange={handleChange}
              />
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({
                  ...formData,
                  photo: e.target.files[0]
                })}
              />
            </div>

          {/* Reason of Visit - Mandatory - Full Width */}
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
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Has Device? */}
          <div className="form-group full-width">
            <label>Carrying any Device/Laptop? <span>*</span></label>
            <div style={{ position: "relative" }}>
              <Laptop size={18} style={iconStyle} />
              <select
                name="hasDevice"
                required
                style={inputStyle}
                value={formData.hasDevice}
                onChange={handleChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {formData.hasDevice === "Yes" && (
            <>
              {/* Device Type */}
              <div className="form-group">
                <label>Device Type <span>*</span></label>
                <div style={{ position: "relative" }}>
                  <Laptop size={18} style={iconStyle} />
                  <input
                    type="text"
                    name="deviceType"
                    required
                    placeholder="e.g. Laptop, Tablet"
                    style={inputStyle}
                    value={formData.deviceType}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Device Make */}
              <div className="form-group">
                <label>Device Make <span>*</span></label>
                <div style={{ position: "relative" }}>
                  <Laptop size={18} style={iconStyle} />
                  <input
                    type="text"
                    name="deviceMake"
                    required
                    placeholder="e.g. Dell, Apple"
                    style={inputStyle}
                    value={formData.deviceMake}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Device Serial Number */}
              <div className="form-group full-width">
                <label>Device Serial Number <span>*</span></label>
                <div style={{ position: "relative" }}>
                  <Hash size={18} style={iconStyle} />
                  <input
                    type="text"
                    name="deviceSerialNumber"
                    required
                    placeholder="Enter Serial Number"
                    style={inputStyle}
                    value={formData.deviceSerialNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

        </div>

        <button type="submit" className="btn-submit">
          <Save size={18} style={{ marginRight: 8 }} />
          Send Invite
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

