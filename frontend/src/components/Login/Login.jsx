import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import "./Login.css";

// Dummy user database
const DUMMY_USERS = [
  {
    email: "admin@inventoryhub.com",
    password: "admin123",
    role: "Admin",
    name: "John Anderson",
    avatar:
      "https://ui-avatars.com/api/?name=John+Anderson&background=6366F1&color=fff",
  },
  {
    email: "manager@inventoryhub.com",
    password: "manager123",
    role: "Manager",
    name: "Sarah Williams",
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Williams&background=10B981&color=fff",
  },
  {
    email: "employee@inventoryhub.com",
    password: "employee123",
    role: "Employee",
    name: "Mike Johnson",
    avatar:
      "https://ui-avatars.com/api/?name=Mike+Johnson&background=F59E0B&color=fff",
  },
];

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Admin",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(""); // Clear error when user types
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Find user in dummy database
      const user = DUMMY_USERS.find(
        (u) =>
          u.email === formData.email &&
          u.password === formData.password &&
          u.role === formData.role,
      );

      if (user) {
        // Login successful
        login(user.email, user.password, user.role, user.name, user.avatar);
        navigate("/dashboard");
      } else {
        // Login failed
        setError("Invalid email, password, or role. Please try again.");
        setLoading(false);
      }
    }, 1000); // 1 second delay to simulate API call
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo">
            <span className="logo-letter">i</span>
          </div>
          <h1 className="brand-name">InventoryHub</h1>
        </div>
        <div className="login-illustration">
          <div className="illustration-circle circle-1"></div>
          <div className="illustration-circle circle-2"></div>
          <div className="illustration-circle circle-3"></div>
        </div>
        <p className="login-tagline">Laptop & Software Inventory Management</p>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Demo Credentials Info */}
            <div className="demo-credentials">
              <h4>Demo Credentials</h4>
              <div className="credential-list">
                <div className="credential-item">
                  <strong>Admin:</strong> admin@inventoryhub.com / admin123
                </div>
                <div className="credential-item">
                  <strong>Manager:</strong> manager@inventoryhub.com /
                  manager123
                </div>
                <div className="credential-item">
                  <strong>Employee:</strong> employee@inventoryhub.com /
                  employee123
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Role Field */}
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* Social Login (Optional) */}
            <div className="social-login">
              <button type="button" className="social-btn google-btn">
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
                Continue with Google
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="signup-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
