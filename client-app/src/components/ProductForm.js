import React, { useState, useEffect } from "react";
import "../Styles/Dashboard.css";
import "../Styles/modal.css";

export default function ProductForm({ product, onClose }) {
  const isEditing = !!product;

  const [form, setForm] = useState({
    ProductID: product?.ProductID || null,
    ProductCode: product?.ProductCode || "",
    ProductName: product?.ProductName || "",
    CategoryID: product?.CategoryID || "",
    ListPrice: product?.ListPrice || 0,
    DiscountPercent: product?.DiscountPercent || 0,
    Description: product?.Description || "",
    ImageURL: product?.ImageURL || "",
  });

  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.ImageURL || "");

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5077/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Set ImageURL to filename (or you could upload to server first)
      const fileName = `images/${file.name}`;
      setForm({
        ...form,
        ImageURL: fileName,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.ProductCode || !form.ProductName || !form.CategoryID || !form.ListPrice) {
      alert("Please fill in all required fields.");
      return;
    }

    const endpoint = isEditing
      ? `http://localhost:5077/api/products/${form.ProductID}`
      : "http://localhost:5077/api/products";

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
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
              name="ProductCode"
              placeholder="Product Code (Max 10 chars)"
              value={form.ProductCode}
              onChange={handleChange}
              maxLength="10"
              required
            />

            <input
              className="dashboard-input"
              name="ProductName"
              placeholder="Product Name *"
              value={form.ProductName}
              onChange={handleChange}
              required
            />

            <select
              className="dashboard-input"
              name="CategoryID"
              value={form.CategoryID}
              onChange={handleChange}
              required
            >
              <option value="">Select Category *</option>
              {categories.map((category) => (
                <option key={category.CategoryID} value={category.CategoryID}>
                  {category.CategoryName}
                </option>
              ))}
            </select>

            <input
              className="dashboard-input"
              name="ListPrice"
              type="number"
              step="0.01"
              placeholder="List Price *"
              value={form.ListPrice}
              onChange={handleChange}
              required
            />

            <input
              className="dashboard-input"
              name="DiscountPercent"
              type="number"
              step="0.01"
              placeholder="Discount %"
              value={form.DiscountPercent}
              onChange={handleChange}
            />

            {/* Image Upload Section */}
            <div className="dashboard-input-group">
              <label htmlFor="imageUpload" className="dashboard-label">
                Product Image
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="dashboard-input"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      marginTop: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "4px"
                    }}
                  />
                </div>
              )}
            </div>

            <textarea
              className="dashboard-input"
              name="Description"
              placeholder="Description"
              value={form.Description}
              onChange={handleChange}
              rows={4}
              style={{ gridColumn: "1 / -1" }}
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
