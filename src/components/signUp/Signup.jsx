import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import "./Signup.css";

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
    role: "Employee",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
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
    if (name !== "agreeTerms" && name !== "role" && name !== "department") {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validateField(name, newValue),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    /* run all validations */
    const errors = {};
    [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "confirmPassword",
    ].forEach((f) => {
      const msg = validateField(f, formData[f]);
      if (msg) errors[f] = msg;
    });
    if (!formData.agreeTerms) errors.agreeTerms = "You must accept the terms";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setError("Please fix the errors below before continuing.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    }, 1500);
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

            {/* ── Role ── */}
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <ShieldCheck className="input-icon" size={20} />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
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

            {/* ── Terms ── */}
            <div className="form-group terms-group">
              <label
                className={`checkbox-label ${fieldErrors.agreeTerms ? "checkbox-error" : ""}`}
              >
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span>
                  I agree to the{" "}
                  <a href="#" className="terms-link">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="terms-link">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <span className="field-error">{fieldErrors.agreeTerms}</span>
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

            {/* ── Divider ── */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* ── Google ── */}
            <div className="social-login">
              <button type="button" className="social-btn">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>
            </div>

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
