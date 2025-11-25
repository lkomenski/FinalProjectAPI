import React, { useState } from "react";
import { validateEmail, validatePassword } from "../../scripts";
import "../../Styles/Auth.css";

export default function ResetPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestReset(e) {
    e.preventDefault();

    if (!emailAddress) {
      setError("Email address is required.");
      return;
    }

    if (!validateEmail(emailAddress)) {
      setError("Please enter a valid email address.");
      return;
    }

    const res = await fetch("http://localhost:5077/api/password/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailAddress })
    });

    const data = await res.json();

    if (!res.ok) return setError(data.message || "Unable to send reset link.");

    setSent(true);
    setToken(data.token); // developer-only for testing
    setMessage("Reset token generated. Enter it below.");
    setError("");
  }

  async function submitNewPassword(e) {
    e.preventDefault();

    if (!token) {
      setError("Reset token is required.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters and contain at least one letter and one number.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const res = await fetch("http://localhost:5077/api/password/reset", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailAddress,
        resetToken: token,
        newPassword,
        confirmPassword
      })
    });

    const data = await res.json();

    if (!res.ok) return setError(data.message);

    setMessage("Password updated! Redirecting to login...");
    setTimeout(() => (window.location.href = "/login"), 1500);
  }

  return (
    <div className="auth-container">
      <h2>Password Reset</h2>

      {message && <p className="auth-message success">{message}</p>}
      {error && <p className="auth-message error">{error}</p>}

      {!sent ? (
        <form onSubmit={requestReset} className="auth-form">
          <input
            id="reset-email"
            name="emailAddress"
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            autoComplete="email"
          />

          <button type="submit" className="auth-btn">
            Send Reset Link
          </button>
        </form>
      ) : (
        <form onSubmit={submitNewPassword} className="auth-form">

          <input
            id="reset-token"
            name="resetToken"
            type="text"
            className="auth-input"
            placeholder="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />

          <input
            id="reset-newPassword"
            name="newPassword"
            type="password"
            className="auth-input"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />

          <input
            id="reset-confirmPassword"
            name="confirmPassword"
            type="password"
            className="auth-input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button type="submit" className="auth-btn">
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}
