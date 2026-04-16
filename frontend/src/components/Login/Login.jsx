import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import "./Login.css";

const Login = () => {
  const { login, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // 🔥 Redirect if already logged in
  useEffect(() => {
  if (isAuthenticated) {
    navigate("/dashboard", { replace: true });
  }
}, [isAuthenticated]);

  // 🔹 Handle input change
  const handleChange = (e) => {
  setError("");

  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  // 🔹 Handle submit
  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  // 🔥 Trim values (important)
  const email = formData.email.trim();
  const password = formData.password.trim();

  // 🔥 Validation
  if (!email || !password) {
    setError("Please fill in all fields");
    setLoading(false);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setError("Please enter a valid email");
    setLoading(false);
    return;
  }

  try {
    const result = await login(email, password);

    if (!result.success) {
      setError(result.message || "Invalid credentials");
      return;
    }

    // ✅ SUCCESS → let useEffect handle redirect
  } catch (err) {
    setError(err?.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
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

        <p className="login-tagline">
          Laptop & Software Inventory Management
        </p>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* 🔥 Error */}
            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

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