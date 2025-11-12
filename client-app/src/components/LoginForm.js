import React, { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");   // NEW: user role
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    if (!email.includes("@")) {
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
      const response = await fetch("https://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        setError("Invalid email, password, or role.");
        setSuccess("");
        return;
      }

      const data = await response.json();

      // Save user info in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userID,
          role: data.role,
          firstName: data.firstName,
          email: data.email
        })
      );

      setSuccess(`Welcome back, ${data.firstName}!`);
      setError("");

      // Redirect based on dashboard value
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
    <div style={{ textAlign: "center", paddingTop: "40px" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>

        {/* Role Selector */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Employee/Admin</option>
        </select>
        <br/>

        <button type="submit">Login</button>

      </form>

      {/* Display messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default LoginForm;
