import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Building2 } from "lucide-react";
import "./AddManager.css";

const AddManager = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would use the JWT token from the logged-in admin.
      // E.g., const token = localStorage.getItem('token');
      // fetch("/api/admin/add-manager", { headers: { Authorization: `Bearer ${token}` } })
      
      // Simulating API call for now, since auth persistence isn't fully hooked up in frontend yet
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        // Clear form after success
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          department: "",
          password: "",
        });
        setTimeout(() => setSuccess(false), 3000);
      }, 1000);

    } catch (err) {
      setLoading(false);
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="add-manager-container">
      <div className="add-manager-card">
        <div className="card-header">
          <h2>Add New Manager</h2>
          <p>Create a new manager account with administrative privileges.</p>
        </div>

        {error && (
          <div className="message-box error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="message-box success-box">
            <CheckCircle size={20} />
            <span>Manager created successfully!</span>
          </div>
        )}

        <form className="add-manager-form" onSubmit={handleCreateManager}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name*</label>
              <div className="input-with-icon">
                <User size={18} className="icon" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Last Name*</label>
              <div className="input-with-icon">
                <User size={18} className="icon" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address*</label>
              <div className="input-with-icon">
                <Mail size={18} className="icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane.doe@inventoryhub.com"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Department</label>
              <div className="input-with-icon">
                <Building2 size={18} className="icon" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="IT Operations"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Temporary Password*</label>
            <div className="input-with-icon">
              <Lock size={18} className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Secure Password"
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Manager"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddManager;
