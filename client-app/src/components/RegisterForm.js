import React, { useState } from "react";

function RegisterForm() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError("All fields are required.");
      return false;
    }
    if (!form.email.includes("@")) {
      setError("Enter a valid email.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const bodyData = {
      emailAddress: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      confirmPassword: form.confirmPassword
    };

    try {
      const res = await fetch("https://localhost:5001/api/auth/register-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      const data = await res.json();
      setSuccess("Account created successfully! You can now log in.");

    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div>
      <h2>Create Customer Account</h2>
      <form onSubmit={handleRegister}>
        <input name="email" placeholder="Email" onChange={updateField} /><br/>
        <input name="firstName" placeholder="First Name" onChange={updateField} /><br/>
        <input name="lastName" placeholder="Last Name" onChange={updateField} /><br/>
        <input type="password" name="password" placeholder="Password" onChange={updateField} /><br/>
        <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={updateField} /><br/>

        <button type="submit">Register</button>
      </form>

      {error && <p style={{color:"red"}}>{error}</p>}
      {success && <p style={{color:"green"}}>{success}</p>}
    </div>
  );
}

export default RegisterForm;
