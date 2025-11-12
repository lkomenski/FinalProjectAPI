import React, { useState } from "react";
import "../Styles/Auth.css";

export default function LoginForm() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (!role) {
      setError("Please select a role.");
      return false;
    }

    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("https://localhost:5077/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, password, role }),
      });

      // Show REAL backend messages
      if (!response.ok) {
        const msg = await response.text();
        setError(msg || "Login failed.");
        setSuccess("");
        return;
      }

      const data = await response.json();

      // Save user info (fixed)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userID,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,      // ⭐ ADDED
          emailAddress: data.emailAddress
        })
      );

      setSuccess(`Welcome back, ${data.firstName}!`);
      setError("");

      // Redirect
      if (data.dashboard === "customer") {
        window.location.href = "/customer-dashboard";
      } else if (data.dashboard === "vendor") {
        window.location.href = "/vendor-dashboard";
      } else if (data.dashboard === "admin") {
        window.location.href = "/admin-dashboard";
      }

    } catch (err) {
      setError("Server error. Please try again later.");
      setSuccess("");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      {error && <p className="auth-message error">{error}</p>}
      {success && <p className="auth-message success">{success}</p>}

      <form onSubmit={handleLogin} className="auth-form">

        <input
          type="email"
          name="emailAddress"
          className="auth-input"
          placeholder="Email Address"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />

        <input
          type="password"
          className="auth-input"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="auth-input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Employee / Admin</option>
        </select>

        <button className="auth-btn" type="submit">
          Login
        </button>

      </form>
    </div>
  );
}
