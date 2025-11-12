import React, { useState } from "react";
import "../Styles/Dashboard.css";
import "../Styles/modal.css";

export default function VendorForm({ vendor, onClose }) {
  const [form, setForm] = useState({
    VendorID: vendor?.VendorID || null,
    VendorName: vendor?.VendorName || "",
    VendorAddress1: vendor?.VendorAddress1 || "",
    VendorAddress2: vendor?.VendorAddress2 || "",
    VendorCity: vendor?.VendorCity || "",
    VendorState: vendor?.VendorState || "",
    VendorZipCode: vendor?.VendorZipCode || "",
    VendorPhone: vendor?.VendorPhone || "",
    VendorContactFName: vendor?.VendorContactFName || "",
    VendorContactLName: vendor?.VendorContactLName || "",
    DefaultTermsID: vendor?.DefaultTermsID || "",
    DefaultAccountNo: vendor?.DefaultAccountNo || "",
  });

  const isEditing = !!vendor;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isEditing
      ? "https://localhost:5077/api/vendor/update"
      : "https://localhost:5077/api/vendor/add";

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <h2 className="modal-title">
          {isEditing ? "Edit Vendor" : "Add Vendor"}
        </h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* A grid layout for cleaner form structure */}
          <div className="modal-grid">

            <input className="dashboard-input" name="VendorName" placeholder="Vendor Name"
                   value={form.VendorName} onChange={handleChange} required />

            <input className="dashboard-input" name="VendorCity" placeholder="City"
                   value={form.VendorCity} onChange={handleChange} required />

            <input className="dashboard-input" name="VendorState" placeholder="State"
                   value={form.VendorState} onChange={handleChange} required />

            <input className="dashboard-input" name="VendorZipCode" placeholder="Zip Code"
                   value={form.VendorZipCode} onChange={handleChange} />

            <input className="dashboard-input" name="VendorPhone" placeholder="Phone"
                   value={form.VendorPhone} onChange={handleChange} />

            <input className="dashboard-input" name="VendorContactFName" placeholder="Contact First Name"
                   value={form.VendorContactFName} onChange={handleChange} />

            <input className="dashboard-input" name="VendorContactLName" placeholder="Contact Last Name"
                   value={form.VendorContactLName} onChange={handleChange} />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="dashboard-btn dashboard-btn-success">
              {isEditing ? "Update Vendor" : "Add Vendor"}
            </button>

            <button type="button" className="dashboard-btn dashboard-btn-danger" onClick={onClose}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
