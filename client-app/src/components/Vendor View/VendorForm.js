import React, { useState, useEffect } from "react";
import { 
  validateAlphaNumeric, 
  validateAlphaOnly, 
  validatePhoneNumber, 
  formatPhoneNumber, 
  validateZipCode, 
  validateState 
} from "../../scripts";
import "../../Styles/Dashboard.css";
import "../../Styles/modal.css";

export default function VendorForm({ vendor, onClose }) {
  const [form, setForm] = useState({
    VendorID: vendor?.VendorID || vendor?.vendorID || null,
    VendorName: vendor?.VendorName || vendor?.vendorName || "",
    VendorAddress1: vendor?.VendorAddress1 || vendor?.vendorAddress1 || "",
    VendorAddress2: vendor?.VendorAddress2 || vendor?.vendorAddress2 || "",
    VendorCity: vendor?.VendorCity || vendor?.vendorCity || "",
    VendorState: vendor?.VendorState || vendor?.vendorState || "",
    VendorZipCode: vendor?.VendorZipCode || vendor?.vendorZipCode || "",
    VendorPhone: vendor?.VendorPhone || vendor?.vendorPhone || "",
    VendorContactFName: vendor?.VendorContactFName || vendor?.vendorContactFName || "",
    VendorContactLName: vendor?.VendorContactLName || vendor?.vendorContactLName || "",
    DefaultTermsID: vendor?.DefaultTermsID || vendor?.defaultTermsID || "",
    DefaultAccountNo: vendor?.DefaultAccountNo || vendor?.defaultAccountNo || "",
  });

  const [errors, setErrors] = useState({});
  const [terms, setTerms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const isEditing = !!vendor;

  // Update form when vendor prop changes
  useEffect(() => {
    if (vendor) {
      setForm({
        VendorID: vendor.VendorID || vendor.vendorID || null,
        VendorName: vendor.VendorName || vendor.vendorName || "",
        VendorAddress1: vendor.VendorAddress1 || vendor.vendorAddress1 || "",
        VendorAddress2: vendor.VendorAddress2 || vendor.vendorAddress2 || "",
        VendorCity: vendor.VendorCity || vendor.vendorCity || "",
        VendorState: vendor.VendorState || vendor.vendorState || "",
        VendorZipCode: vendor.VendorZipCode || vendor.vendorZipCode || "",
        VendorPhone: vendor.VendorPhone || vendor.vendorPhone || "",
        VendorContactFName: vendor.VendorContactFName || vendor.vendorContactFName || "",
        VendorContactLName: vendor.VendorContactLName || vendor.vendorContactLName || "",
        DefaultTermsID: vendor.DefaultTermsID || vendor.defaultTermsID || "",
        DefaultAccountNo: vendor.DefaultAccountNo || vendor.defaultAccountNo || "",
      });
    }
  }, [vendor]);

  // Fetch terms and accounts when component mounts
  useEffect(() => {
    fetchTerms();
    fetchAccounts();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await fetch("http://localhost:5077/api/vendors/terms");
      const data = await response.json();
      setTerms(data);
    } catch (error) {
      console.error("Error fetching terms:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch("http://localhost:5077/api/vendors/accounts");
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number as user types
    let formattedValue = value;
    if (name === "VendorPhone") {
      formattedValue = formatPhoneNumber(value);
    }
    
    // Convert state to uppercase
    if (name === "VendorState") {
      formattedValue = value.toUpperCase();
    }
    
    setForm({
      ...form,
      [name]: formattedValue
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Vendor Name - required, alphanumeric
    if (!form.VendorName || form.VendorName.trim() === "") {
      newErrors.VendorName = "Vendor Name is required";
    } else if (!validateAlphaNumeric(form.VendorName)) {
      newErrors.VendorName = "Vendor Name can only contain letters, numbers, and spaces";
    } else if (form.VendorName.length > 50) {
      newErrors.VendorName = "Vendor Name must be 50 characters or less";
    }

    // Address1 - required, alphanumeric
    if (!form.VendorAddress1 || form.VendorAddress1.trim() === "") {
      newErrors.VendorAddress1 = "Address Line 1 is required";
    } else if (!validateAlphaNumeric(form.VendorAddress1)) {
      newErrors.VendorAddress1 = "Address can only contain letters, numbers, and spaces";
    }

    // Address2 - optional but validate if provided
    if (form.VendorAddress2 && !validateAlphaNumeric(form.VendorAddress2)) {
      newErrors.VendorAddress2 = "Address can only contain letters, numbers, and spaces";
    }

    // City - required, alpha only
    if (!form.VendorCity || form.VendorCity.trim() === "") {
      newErrors.VendorCity = "City is required";
    } else if (!validateAlphaOnly(form.VendorCity)) {
      newErrors.VendorCity = "City can only contain letters and spaces";
    } else if (form.VendorCity.length > 40) {
      newErrors.VendorCity = "City must be 40 characters or less";
    }

    // State - required, exactly 2 uppercase letters
    if (!form.VendorState || form.VendorState.trim() === "") {
      newErrors.VendorState = "State is required";
    } else if (!validateState(form.VendorState)) {
      newErrors.VendorState = "State must be 2 uppercase letters (e.g., CA, NY)";
    }

    // Zip Code - required, 5 digits
    if (!form.VendorZipCode || form.VendorZipCode.trim() === "") {
      newErrors.VendorZipCode = "Zip Code is required";
    } else if (!validateZipCode(form.VendorZipCode)) {
      newErrors.VendorZipCode = "Zip Code must be exactly 5 digits";
    }

    // Phone - required, 10 digits
    if (!form.VendorPhone || form.VendorPhone.trim() === "") {
      newErrors.VendorPhone = "Phone is required";
    } else {
      const digitsOnly = form.VendorPhone.replace(/\D/g, '');
      if (!validatePhoneNumber(digitsOnly)) {
        newErrors.VendorPhone = "Phone must be exactly 10 digits";
      }
    }

    // Contact First Name - required, alpha only
    if (!form.VendorContactFName || form.VendorContactFName.trim() === "") {
      newErrors.VendorContactFName = "Contact First Name is required";
    } else if (!validateAlphaOnly(form.VendorContactFName)) {
      newErrors.VendorContactFName = "First Name can only contain letters and spaces";
    }

    // Contact Last Name - required, alpha only
    if (!form.VendorContactLName || form.VendorContactLName.trim() === "") {
      newErrors.VendorContactLName = "Contact Last Name is required";
    } else if (!validateAlphaOnly(form.VendorContactLName)) {
      newErrors.VendorContactLName = "Last Name can only contain letters and spaces";
    }

    // Default Terms - required
    if (!form.DefaultTermsID || form.DefaultTermsID === "") {
      newErrors.DefaultTermsID = "Payment Terms are required";
    }

    // Default Account - required
    if (!form.DefaultAccountNo || form.DefaultAccountNo === "") {
      newErrors.DefaultAccountNo = "Default Account is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    try {
      const endpoint = isEditing
        ? `http://localhost:5077/api/vendors/${form.VendorID}`
        : "http://localhost:5077/api/vendors";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const responseData = await response.json();
        const savedVendor = responseData.vendor || responseData;
        
        if (isEditing) {
          alert(`Vendor "${savedVendor.VendorName || savedVendor.vendorName}" updated successfully!`);
        } else {
          alert(`Vendor "${savedVendor.VendorName || savedVendor.vendorName}" added successfully with ID: ${savedVendor.VendorID || savedVendor.vendorID}`);
        }
        
        onClose(savedVendor); // Pass back the saved vendor data
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        alert(`Error: ${errorData.message || errorData.error || "Failed to save vendor"}`);
      }
    } catch (error) {
      console.error('Error submitting vendor:', error);
      alert('An error occurred while saving the vendor. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        <div className="modal-header">
          <h2 className="modal-title lg">
            {isEditing ? "Edit Vendor" : "Add Vendor"}
          </h2>
          <button className="modal-close" onClick={onClose} type="button">×</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* A grid layout for cleaner form structure */}
          <div className="modal-grid">

            <div className="form-field">
              <label className="form-label">Vendor Name *</label>
              <input 
                className={`dashboard-input ${errors.VendorName ? "input-error" : ""}`}
                name="VendorName" 
                placeholder="Vendor Name"
                value={form.VendorName} 
                onChange={handleChange} 
                maxLength="50"
                required 
              />
              {errors.VendorName && (
                <span className="error-message">{errors.VendorName}</span>
              )}
              <span className="character-count">{form.VendorName.length}/50</span>
            </div>

            <div className="form-field">
              <label className="form-label">Address Line 1 *</label>
              <input 
                className={`dashboard-input ${errors.VendorAddress1 ? "input-error" : ""}`}
                name="VendorAddress1" 
                placeholder="Address Line 1"
                value={form.VendorAddress1} 
                onChange={handleChange} 
                maxLength="50"
                required
              />
              {errors.VendorAddress1 && (
                <span className="error-message">{errors.VendorAddress1}</span>
              )}
              <span className="character-count">{form.VendorAddress1.length}/50</span>
            </div>

            <div className="form-field">
              <label className="form-label">Address Line 2</label>
              <input 
                className={`dashboard-input ${errors.VendorAddress2 ? "input-error" : ""}`}
                name="VendorAddress2" 
                placeholder="Address Line 2 (optional)"
                value={form.VendorAddress2} 
                onChange={handleChange} 
                maxLength="50"
              />
              {errors.VendorAddress2 && (
                <span className="error-message">{errors.VendorAddress2}</span>
              )}
              <span className="character-count">{form.VendorAddress2.length}/50</span>
            </div>

            <div className="form-field">
              <label className="form-label">City *</label>
              <input 
                className={`dashboard-input ${errors.VendorCity ? "input-error" : ""}`}
                name="VendorCity" 
                placeholder="City"
                value={form.VendorCity} 
                onChange={handleChange} 
                maxLength="40"
                required 
              />
              {errors.VendorCity && (
                <span className="error-message">{errors.VendorCity}</span>
              )}
              <span className="character-count">{form.VendorCity.length}/40</span>
            </div>

            <div className="form-field">
              <label className="form-label">State *</label>
              <input 
                className={`dashboard-input ${errors.VendorState ? "input-error" : ""}`}
                name="VendorState" 
                placeholder="CA"
                value={form.VendorState} 
                onChange={handleChange} 
                maxLength="2"
                style={{ textTransform: 'uppercase' }}
                required 
              />
              {errors.VendorState && (
                <span className="error-message">{errors.VendorState}</span>
              )}
              <span className="character-count">{form.VendorState.length}/2</span>
            </div>

            <div className="form-field">
              <label className="form-label">Zip Code *</label>
              <input 
                className={`dashboard-input ${errors.VendorZipCode ? "input-error" : ""}`}
                name="VendorZipCode" 
                placeholder="12345"
                value={form.VendorZipCode} 
                onChange={handleChange} 
                maxLength="10"
                required
              />
              {errors.VendorZipCode && (
                <span className="error-message">{errors.VendorZipCode}</span>
              )}
              <span className="character-count">{form.VendorZipCode.length}/10</span>
            </div>

            <div className="form-field">
              <label className="form-label">Phone *</label>
              <input 
                className={`dashboard-input ${errors.VendorPhone ? "input-error" : ""}`}
                name="VendorPhone" 
                placeholder="(555)-555-5555"
                value={form.VendorPhone} 
                onChange={handleChange}
                required
              />
              {errors.VendorPhone && (
                <span className="error-message">{errors.VendorPhone}</span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label">Contact First Name *</label>
              <input 
                className={`dashboard-input ${errors.VendorContactFName ? "input-error" : ""}`}
                name="VendorContactFName" 
                placeholder="First Name"
                value={form.VendorContactFName} 
                onChange={handleChange} 
                maxLength="50"
                required
              />
              {errors.VendorContactFName && (
                <span className="error-message">{errors.VendorContactFName}</span>
              )}
              <span className="character-count">{form.VendorContactFName.length}/50</span>
            </div>

            <div className="form-field">
              <label className="form-label">Contact Last Name *</label>
              <input 
                className={`dashboard-input ${errors.VendorContactLName ? "input-error" : ""}`}
                name="VendorContactLName" 
                placeholder="Last Name"
                value={form.VendorContactLName} 
                onChange={handleChange} 
                maxLength="50"
                required
              />
              {errors.VendorContactLName && (
                <span className="error-message">{errors.VendorContactLName}</span>
              )}
              <span className="character-count">{form.VendorContactLName.length}/50</span>
            </div>

            <div className="form-field">
              <label className="form-label">Default Payment Terms *</label>
              <select
                className={`dashboard-input ${errors.DefaultTermsID ? "input-error" : ""}`}
                name="DefaultTermsID"
                value={form.DefaultTermsID}
                onChange={handleChange}
                required
              >
                <option value="">Select Terms</option>
                {terms.map((term) => (
                  <option key={term.TermsID || term.termsID} value={term.TermsID || term.termsID}>
                    {term.TermsDescription || term.termsDescription}
                  </option>
                ))}
              </select>
              {errors.DefaultTermsID && (
                <span className="error-message">{errors.DefaultTermsID}</span>
              )}
            </div>

            <div className="form-field">
              <label className="form-label">Default Account *</label>
              <select
                className={`dashboard-input ${errors.DefaultAccountNo ? "input-error" : ""}`}
                name="DefaultAccountNo"
                value={form.DefaultAccountNo}
                onChange={handleChange}
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.AccountNo || account.accountNo} value={account.AccountNo || account.accountNo}>
                    {account.AccountDescription || account.accountDescription}
                  </option>
                ))}
              </select>
              {errors.DefaultAccountNo && (
                <span className="error-message">{errors.DefaultAccountNo}</span>
              )}
            </div>
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
