import React, { useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
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
    setError("");
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!role) {
      setError("Please select a role.");
      return;
    }

    try {
      const response = await fetch("https://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

    if (response.ok) {
      const data = await response.json();
      setSuccess(`Welcome back, ${data.firstName}!`);
      setError("");

      // Save user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ role: data.dashboard, firstName: data.firstName, email })
      );

      // Redirect based on role
        if (data.dashboard === "customer") {
          window.location.href = "/customer-dashboard";
        } else if (data.dashboard === "vendor") {
          window.location.href = "/vendor-dashboard";
        } else if (data.dashboard === "admin") {
          window.location.href = "/admin-dashboard";
        }
      } else {
        setError("Invalid email, password, or role.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Select Role</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Employee/Admin</option>
        </select>
        <br/>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default LoginForm;
