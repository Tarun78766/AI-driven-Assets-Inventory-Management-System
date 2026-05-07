import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "./RegisterAPI";

import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Phone,
  Building2,
  ShieldCheck,
} from "lucide-react";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    password: "",
    confirmPassword: "",
    // agreeTerms: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  /* ---------- helpers ---------- */
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { level: 1, label: "Weak", color: "#EF4444" },
      { level: 2, label: "Fair", color: "#F59E0B" },
      { level: 3, label: "Good", color: "#3B82F6" },
      { level: 4, label: "Strong", color: "#10B981" },
    ];
    return map[score - 1] || { level: 0, label: "", color: "" };
  };

  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim().length < 2
          ? "First name must be at least 2 characters"
          : "";
      case "lastName":
        return value.trim().length < 2
          ? "Last name must be at least 2 characters"
          : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? "Enter a valid email address"
          : "";
      case "phone":
        return value && !/^\+?[\d\s\-()]{7,15}$/.test(value)
          ? "Enter a valid phone number"
          : "";
      case "password":
        return value.length < 8 ? "Password must be at least 8 characters" : "";
      case "confirmPassword":
        return value !== formData.password ? "Passwords do not match" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setError("");
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    if (name !== "agreeTerms" && name !== "department") {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name, newValue),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    // 🔥 VALIDATION
    const errors = {};
    ["firstName", "lastName", "email", "password", "confirmPassword"].forEach(
      (f) => {
        const msg = validateField(f, formData[f]);
        if (msg) errors[f] = msg;
      },
    );

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError("Please fix the errors below");
      setLoading(false);
      return;
    }

    // 🔥 PASSWORD MATCH CHECK
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 🔥 CLEAN DATA (VERY IMPORTANT)
      const cleanData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.department,
      };

      await registerUser(cleanData);

      setSuccess(true);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  const strength = getPasswordStrength(formData.password);

  if (success) {
    return (
      <div className="signup-success-screen">
        <div className="success-card">
          <div className="success-icon-wrap">
            <CheckCircle size={56} color="#10B981" />
          </div>
          <h2>Account Created!</h2>
          <p>Your InventoryHub account has been successfully created.</p>
          <p className="redirect-note">Redirecting to login page…</p>
          <div className="success-progress-bar">
            <div className="success-progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      {/* ── Left Panel ── */}
      <div className="signup-left">
        <div className="signup-brand">
          <div className="brand-logo">
            <span className="logo-letter">i</span>
          </div>
          <h1 className="brand-name">InventoryHub</h1>
        </div>

        <div className="signup-illustration">
          <div className="illustration-circle circle-1"></div>
          <div className="illustration-circle circle-2"></div>
          <div className="illustration-circle circle-3"></div>
        </div>

        <div className="signup-features">
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Manage laptops &amp; software licenses</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Track assignments &amp; lifecycle</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Growth forecasting &amp; smart alerts</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot"></div>
            <span>Role-based access control</span>
          </div>
        </div>

        <p className="signup-tagline">
          Laptop &amp; Software Inventory Management
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="signup-right">
        <div className="signup-form-container">
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Join InventoryHub and manage your assets efficiently</p>
          </div>

          {/* Global error */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            {/* ── Row: First + Last Name ── */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <div
                  className={`input-wrapper ${fieldErrors.firstName ? "input-error" : ""}`}
                >
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.firstName && (
                  <span className="field-error">{fieldErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <div
                  className={`input-wrapper ${fieldErrors.lastName ? "input-error" : ""}`}
                >
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Anderson"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.lastName && (
                  <span className="field-error">{fieldErrors.lastName}</span>
                )}
              </div>
            </div>

            {/* ── Email ── */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div
                className={`input-wrapper  ${fieldErrors.email ? "input-error" : ""}`}
              >
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@inventoryhub.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* ── Row: Phone + Department ── */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  Phone <span className="optional">(optional)</span>
                </label>
                <div
                  className={`input-wrapper ${fieldErrors.phone ? "input-error" : ""}`}
                >
                  <Phone className="input-icon" size={20} />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                {fieldErrors.phone && (
                  <span className="field-error">{fieldErrors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  Department <span className="optional">(optional)</span>
                </label>
                <div className="input-wrapper">
                  <Building2 className="input-icon" size={20} />
                  <input
                    type="text"
                    id="department"
                    name="department"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* ── Password ── */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div
                className={`input-wrapper ${fieldErrors.password ? "input-error" : ""}`}
              >
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password strength bar */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="strength-bar"
                        style={{
                          backgroundColor:
                            n <= strength.level ? strength.color : "#E5E7EB",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}

              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div
                className={`input-wrapper ${fieldErrors.confirmPassword ? "input-error" : ""}`}
              >
                <Lock className="input-icon" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>



            {/* ── Submit ── */}
            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </button>



            {/* ── Login link ── */}
            <p className="login-link">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
