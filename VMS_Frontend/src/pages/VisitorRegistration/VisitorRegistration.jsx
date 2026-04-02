import React, { useState } from "react";
import API from "../../app/apiClient";
import { User, Mail, Phone, MapPin, Building, Briefcase, Hash, Save, ClipboardList, Laptop, CheckCircle } from "lucide-react";
import "./VisitorRegistration.css";

export default function VisitorRegistration() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pabx: "",
    unit: "",
    department: "",
    location: "",
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
      access_level: "Visitor (Level 1)",
      host_id: null,
      hasDevice: formData.hasDevice,
      deviceType: formData.deviceType,
      deviceMake: formData.deviceMake,
      deviceSerialNumber: formData.deviceSerialNumber
    };

    try {
      await API.post("/visitor-requests", payload);
      setSubmitted(true);
    } catch (error) {
      console.error("ERROR:", error);
      alert("❌ Failed to submit registration");
    }
  };

  const unitOptions = ["IT Services", "Manufacturing", "Logistics", "Corporate", "HR", "Finance", "Operations", "Sales", "Marketing"];
  const locationOptions = ["Pune Corporate", "Bangalore HQ", "Mumbai West", "Delhi NCR", "Chennai", "Hyderabad", "Kolkata"];
  const departmentOptions = ["IT", "Human Resources", "Finance", "Operations", "Sales", "Marketing", "Legal", "Customer Support"];

  if (submitted) {
    return (
      <div className="registration-wrapper">
        <div className="success-container">
          <CheckCircle size={64} className="success-icon" />
          <h2>Registration Successful</h2>
          <p>Your details have been submitted. Please wait at the reception for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-wrapper">
      <div className="reg-form-container">
        <div className="reg-form-header">
          <h2>
            <User /> Self Registration
          </h2>
          <p>Please enter your details accurately for visitor access.</p>
        </div>

        <form className="reg-form-content" onSubmit={handleSubmit}>
          <div className="reg-form-grid">
            <div className="form-group">
              <label>Full Name <span>*</span></label>
              <div style={{ position: "relative" }}>
                <User size={18} className="input-icon" />
                <input type="text" name="name" required placeholder="Enter full name" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Email ID</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} className="input-icon" />
                <input type="email" name="email" placeholder="visitor@company.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number <span>*</span></label>
              <div style={{ position: "relative" }}>
                <Phone size={18} className="input-icon" />
                <input type="tel" name="phone" required placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>PABX Phone Number</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} className="input-icon" />
                <input type="text" name="pabx" placeholder="Extension (e.g. 405)" value={formData.pabx} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Unit</label>
              <div style={{ position: "relative" }}>
                <Building size={18} className="input-icon" />
                <select name="unit" value={formData.unit} onChange={handleChange}>
                  <option value="">Select Unit</option>
                  {unitOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Department</label>
              <div style={{ position: "relative" }}>
                <Briefcase size={18} className="input-icon" />
                <select name="department" value={formData.department} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {departmentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} className="input-icon" />
                <select name="location" value={formData.location} onChange={handleChange}>
                  <option value="">Select Location</option>
                  {locationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Type Of ID Proof</label>
              <div style={{ position: "relative" }}>
                <ClipboardList size={18} className="input-icon" />
                <select name="typeOfIDProof" value={formData.typeOfIDProof} onChange={handleChange}>
                  <option value="">Select ID Proof</option>
                  <option value="Aadhar Card">Aadhar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>ID Proof Number</label>
              <div style={{ position: "relative" }}>
                <Hash size={18} className="input-icon" />
                <input type="text" name="idProofNumber" placeholder="Enter ID proof number" value={formData.idProofNumber} onChange={handleChange} />
              </div>
              <input type="file" accept="image/*" onChange={(e) => setFormData({ ...formData, photo: e.target.files[0] })} />
            </div>

            <div className="form-group full-width">
              <label>Reason of Visit <span>*</span></label>
              <div style={{ position: "relative" }}>
                <ClipboardList size={18} className="input-icon" />
                <select name="reasonOfVisit" required value={formData.reasonOfVisit} onChange={handleChange}>
                  <option value="">Select Reason</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Interview">Interview</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Carrying any Device/Laptop? <span>*</span></label>
              <div style={{ position: "relative" }}>
                <Laptop size={18} className="input-icon" />
                <select name="hasDevice" required value={formData.hasDevice} onChange={handleChange}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {formData.hasDevice === "Yes" && (
              <>
                <div className="form-group">
                  <label>Device Type <span>*</span></label>
                  <div style={{ position: "relative" }}>
                    <Laptop size={18} className="input-icon" />
                    <input type="text" name="deviceType" required placeholder="e.g. Laptop" value={formData.deviceType} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Device Make <span>*</span></label>
                  <div style={{ position: "relative" }}>
                    <Laptop size={18} className="input-icon" />
                    <input type="text" name="deviceMake" required placeholder="e.g. Dell" value={formData.deviceMake} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Device Serial Number <span>*</span></label>
                  <div style={{ position: "relative" }}>
                    <Hash size={18} className="input-icon" />
                    <input type="text" name="deviceSerialNumber" required placeholder="Enter Serial Number" value={formData.deviceSerialNumber} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

          </div>
          <button type="submit" className="reg-submit-btn">
            <Save size={18} style={{ marginRight: 8 }} />
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}
