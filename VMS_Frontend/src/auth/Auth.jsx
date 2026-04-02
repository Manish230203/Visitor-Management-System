import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import apiClient from "../app/apiClient"; 
import { loginSuccess } from "./authSlice";
import logo from "../assets/logo.png";
import { 
  Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 
} from 'lucide-react';
import './Auth.css';

// FIXED: Added the component wrapper function
export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [visitorCount, setVisitorCount] = useState(0);



  useEffect(() => {
  const fetchVisitorCount = async () => {
    try {
      const res = await apiClient.get("/active-visitors-count");
      setVisitorCount(res.data.count);
    } catch (err) {
      console.error("Error fetching visitor count:", err);
    }
  };

  fetchVisitorCount();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = {
      email: e.target.email.value,
      password: e.target.password.value,
      ...( !isLogin && { name: e.target.name.value } ) 
    };

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      
      // 1. Call API
      const res = await apiClient.post(endpoint, formData);
      
      // 2. Dispatch to Redux
      dispatch(loginSuccess(res.data));
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
  
      const role = res.data.user.role;
      if (role === 'host') {
        navigate('/host/dashboard');
      } else {
        navigate(`/${role}/dashboard`);
      }
      
    } catch (err) {
      console.error("Auth Error:", err);
      
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        
        {/* Left Side: Visuals */}
        <div className="auth-visual">
          <div className="visual-content">
           <div className="brand-section">
            <img src={logo} alt="Company Logo" className="auth-logo" />
            <div className="company-name">
              Unique Delta ForceSecurity Pvt. Ltd.
            </div>
        </div>
            
            <h1>{isLogin ? "Welcome Back!" : "Join Us Today"}</h1>
            <p>
              {isLogin 
                ? "Streamline your visitor management workflow with our secure, automated entry system."
                : "Create an account to start managing visitors, generating passes, and tracking security in real-time."
              }
            </p>

            <div className="glass-badge">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>System Operational</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '2rem', fontWeight: 'bold' }}>{visitorCount} </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Active Visitors on Premises</div>
            </div>
          </div>
          
          <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
            © 2026 Unique Delta ForceSecurity Pvt. Ltd.
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="auth-form-side">
          <div className="form-header fade-in" key={isLogin ? 'login-header' : 'signup-header'}>
            <h2>{isLogin ? "Sign In" : "Create Account"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="fade-in" key={isLogin ? 'login-form' : 'signup-form'}>
            
            {!isLogin && (
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input 
                  name="name" 
                  type="text" 
                  className="auth-input" 
                  placeholder="Full Name" 
                  required 
                />
              </div>
            )}

            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input 
                name="email" 
                type="email" 
                className="auth-input" 
                placeholder="Email Address" 
                required 
              />
            </div>

            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                className="auth-input" 
                placeholder="Password" 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', 
                  background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' 
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Sign Up"} 
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span 
              className="toggle-link" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}