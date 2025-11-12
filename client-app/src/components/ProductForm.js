import React, { useState, useEffect } from "react";
import "../Styles/Dashboard.css";
import "./Modal.css";

export default function ProductForm({ product, onClose }) {
  const isEditing = !!product;

  const [form, setForm] = useState({
    ProductID: product?.ProductID || null,
    ProductName: product?.ProductName || "",
    CategoryID: product?.CategoryID || "",
    ListPrice: product?.ListPrice || 0,
    DiscountPercent: product?.DiscountPercent || 0,
    Description: product?.Description || "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isEditing
      ? "https://localhost:5001/api/product/update"
      : "https://localhost:5001/api/product/add";

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
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid">

            <input
              className="dashboard-input"
              name="ProductName"
              placeholder="Product Name"
              value={form.ProductName}
              onChange={handleChange}
              required
            />

            <input
              className="dashboard-input"
              name="ListPrice"
              type="number"
              placeholder="List Price"
              value={form.ListPrice}
              onChange={handleChange}
              required
            />

            <input
              className="dashboard-input"
              name="DiscountPercent"
              type="number"
              placeholder="Discount %"
              value={form.DiscountPercent}
              onChange={handleChange}
            />

            <input
              className="dashboard-input"
              name="CategoryID"
              placeholder="Category ID"
              value={form.CategoryID}
              onChange={handleChange}
              required
            />

            <textarea
              className="dashboard-input"
              name="Description"
              placeholder="Description"
              value={form.Description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="modal-buttons">
            <button type="submit" className="dashboard-btn dashboard-btn-success">
              {isEditing ? "Update Product" : "Add Product"}
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
