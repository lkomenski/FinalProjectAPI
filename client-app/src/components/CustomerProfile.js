import React, { useEffect, useState } from "react";
import "../Styles/ProfilePage.css";
import { fetchData } from "./Api";

export default function CustomerProfile() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load customer profile from API
  useEffect(() => {
    if (!user) {
      setError("No user logged in.");
      setLoading(false);
      return;
    }

    async function loadProfile() {
      try {
        const data = await fetchData(`customer/${user.id}`);

        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          emailAddress: data.emailAddress || "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const updateField = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setError("");
    setMessage("");
  };

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.emailAddress) {
      setError("First name, last name, and email are required.");
      return false;
    }

    if (!form.emailAddress.includes("@")) {
      setError("Enter a valid email address.");
      return false;
    }

    if (form.newPassword || form.confirmNewPassword) {
      if (form.newPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return false;
      }
      if (form.newPassword !== form.confirmNewPassword) {
        setError("Password fields do not match.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const body = {
      customerId: user.id,
      firstName: form.firstName,
      lastName: form.lastName,
      emailAddress: form.emailAddress,
      newPassword: form.newPassword || null,
    };

    try {
      const res = await fetch("https://localhost:5077/api/customer/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Profile update failed.");
        return;
      }

      setMessage("Profile updated successfully!");

      // Update localStorage user
      localStorage.setItem("user", JSON.stringify({
        ...user,
        firstName: body.firstName,
        emailAddress: body.emailAddress
      }));

    } catch (err) {
      setError("Server error updating profile.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      {error && <p className="profile-message error">{error}</p>}
      {message && <p className="profile-message success">{message}</p>}

      <form className="profile-form" onSubmit={handleSave}>

        <div className="profile-row">
          <label>First Name</label>
          <input
            name="firstName"
            className="profile-input"
            value={form.firstName}
            onChange={updateField}
          />
        </div>

        <div className="profile-row">
          <label>Last Name</label>
          <input
            name="lastName"
            className="profile-input"
            value={form.lastName}
            onChange={updateField}
          />
        </div>

        <div className="profile-row">
          <label>Email Address</label>
          <input
            type="email"
            name="emailAddress"
            className="profile-input"
            value={form.emailAddress}
            onChange={updateField}
          />
        </div>

        <h3 className="profile-subtitle">Change Password</h3>

        <div className="profile-row">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            className="profile-input"
            value={form.newPassword}
            onChange={updateField}
          />
        </div>

        <div className="profile-row">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmNewPassword"
            className="profile-input"
            value={form.confirmNewPassword}
            onChange={updateField}
          />
        </div>

        <button className="profile-save-btn" type="submit">
          Save Changes
        </button>

      </form>
    </div>
  );
}
