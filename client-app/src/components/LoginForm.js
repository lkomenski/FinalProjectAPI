import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import "../Styles/Auth.css";

export default function LoginForm() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  
  const { refreshUserCart } = useContext(CartContext);

  const validateForm = () => {
    if (!emailAddress || !password) {
      setError("Email and password are required.");
      return false;
    }

    if (!emailAddress.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:5077/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, password, role }),
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg || "Login failed.");
        setPassword("");    // CLEAR PASSWORD FIELD
        setSuccess("");
        setFailedAttempts(prev => prev + 1);
        return;
      }


      const data = await response.json();

      // SAVE EXACT KEYS RETURNED BY API
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,                 
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          emailAddress: data.emailAddress,
          dashboard: data.dashboard   
        })
      );

      setSuccess(`Welcome back, ${data.firstName}!`);
      setError("");

      // Refresh cart for the logged-in user
      refreshUserCart();

      // Small delay to allow cart to load before redirect
      setTimeout(() => {
        // REDIRECT
        if (data.dashboard === "customer") {
          window.location.href = "/customer-dashboard";
        } else if (data.dashboard === "vendor") {
          window.location.href = "/vendor-dashboard";
        } else if (data.dashboard === "admin") {
          window.location.href = "/admin-dashboard";
        }
      }, 500);

    } catch (err) {
      setError("Server error. Please try again later.");
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <h2>
        {role === "customer" ? "Customer Login" : 
         role === "vendor" ? "Vendor Login" : "Employee Login"}
      </h2>
      {role !== "customer" && (
        <p className="auth-role-indicator">
          <button 
            className="auth-reset-role"
            onClick={() => {
              setRole("customer");
              setFailedAttempts(0);
              setError("");
            }}
            type="button"
          >
            Switch to Customer Login
          </button>
        </p>
      )}

      {error && <p className="auth-message error">{error}</p>}
      {success && <p className="auth-message success">{success}</p>}

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          className="auth-input"
          placeholder="Email Address"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />

        <input
          type="password"
          className="auth-input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" type="submit">
          {role === "customer" ? "Customer Login" : 
           role === "vendor" ? "Vendor Login" : "Employee Login"}
        </button>
      </form>

      {/* Alternative login links */}
      <div className="auth-alternative-logins">
        <p className="auth-alternative-text">Employee or Vendor?</p>
        <div className="auth-alternative-buttons">
          <button 
            className="auth-alternative-btn"
            onClick={() => {
              setRole("vendor");
              setFailedAttempts(0);
              setError("");
            }}
            type="button"
          >
            Vendor Login
          </button>
          <button 
            className="auth-alternative-btn"
            onClick={() => {
              setRole("admin");
              setFailedAttempts(0);
              setError("");
            }}
            type="button"
          >
            Employee Login
          </button>
        </div>
        <p className="auth-vendor-register-text">
          New vendor? 
          <button 
            className="auth-vendor-register-link"
            onClick={() => window.location.href="/register-vendor"}
            type="button"
          >
            Activate your account
          </button>
        </p>
      </div>

      {/* Register link */}
      <div className="auth-register-section">
        <p className="auth-register-text">
          Don't have an account? 
          <button 
            className="auth-register-link"
            onClick={() => window.location.href="/register"}
            type="button"
          >
            Register here
          </button>
        </p>
      </div>

      {/* Reset password link for customers only after failed attempt */}
      {role === "customer" && failedAttempts >= 1 && (
        <div className="auth-reset-section">
          <p className="auth-reset-text">
            Having trouble logging in?
            <button 
              className="auth-reset-link"
              onClick={() => window.location.href="/reset-password"}
              type="button"
            >
              Reset your password
            </button>
          </p>
        </div>
      )}

      {/* Contact administration message for vendors and employees after failed attempt */}
      {(role === "vendor" || role === "admin") && failedAttempts >= 1 && (
        <div className="auth-admin-contact-section">
          <p className="auth-admin-contact-text">
            {role === "vendor" 
              ? "If you're having trouble accessing your vendor account, please contact our business administration team for assistance with password recovery."
              : "If you're unable to access your employee account, please contact your system administrator or IT department for password assistance."
            }
          </p>
        </div>
      )}

    </div>
  );
}
