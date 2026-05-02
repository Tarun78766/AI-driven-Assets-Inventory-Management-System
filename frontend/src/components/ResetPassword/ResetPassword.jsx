import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";
import "../Login/Login.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${APIRoutes.RESET_PASSWORD}/${token}`, { password });
      if (res.data.success) {
        setStatus({ type: "success", message: "Password reset successfully! Redirecting..." });
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to reset password. Link may be expired.",
      });
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
        <p className="login-tagline">Laptop & Software Inventory Management</p>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Set New Password</h2>
            <p>Enter your new password below</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {status.message && (
              <div
                className="error-message"
                style={{
                  backgroundColor: status.type === "success" ? "#d1fae5" : "#fee2e2",
                  color: status.type === "success" ? "#065f46" : "#b91c1c",
                  border: `1px solid ${status.type === "success" ? "#34d399" : "#f87171"}`,
                }}
              >
                {status.type === "success" ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            
            <p className="signup-link">
              Remembered your password? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
