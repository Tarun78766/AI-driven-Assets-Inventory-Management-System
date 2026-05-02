import React from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./FloatingAIBtn.css";

const FloatingAIBtn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Only show to admins and managers
  const role = user?.role?.toLowerCase();
  if (role !== "admin" && role !== "manager") {
    return null;
  }

  return (
    <button 
      className="floating-ai-btn" 
      onClick={() => navigate("/ai-dashboard")}
      title="AI Predictive Maintenance Dashboard"
    >
      <BrainCircuit size={28} />
      <span className="floating-ai-tooltip">AI Predictions</span>
    </button>
  );
};

export default FloatingAIBtn;
