import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";
import "../Login/Login.css"; // Reuse login styles

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!email.trim()) {
      setStatus({ type: "error", message: "Please enter your email address" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(APIRoutes.FORGOT_PASSWORD, { email });
      if (res.data.success) {
        setStatus({ type: "success", message: res.data.message });
      }
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to send reset email",
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
            <h2>Reset Password</h2>
            <p>Enter your email to receive a password reset link</p>
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
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="signup-link">
              Remember your password? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
