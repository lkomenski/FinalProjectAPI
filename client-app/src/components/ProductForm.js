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
    ListPrice: product?.ListPrice || "",
    DiscountPercent: product?.DiscountPercent || "",
    Description: product?.Description || "",
    ImageURL: product?.ImageURL || "",
    QuantityOnHand: product?.QuantityOnHand || 0,
  });

  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.ImageURL || "");
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Update form when product prop changes (for editing)
  useEffect(() => {
    if (product) {
      setForm({
        ProductID: product.ProductID || product.productID || null,
        ProductCode: product.ProductCode || product.productCode || "",
        ProductName: product.ProductName || product.productName || "",
        CategoryID: product.CategoryID || product.categoryID || "",
        ListPrice: product.ListPrice || product.listPrice || "",
        DiscountPercent: product.DiscountPercent || product.discountPercent || "",
        Description: product.Description || product.description || "",
        ImageURL: product.ImageURL || product.imageURL || "",
        QuantityOnHand: product.QuantityOnHand || product.quantityOnHand || 0,
      });
      setImagePreview(product.ImageURL || product.imageURL || "");
    }
  }, [product]);

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
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setHasUnsavedChanges(true);

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }

    // Real-time validation for specific fields
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "ProductCode":
        if (value && value.length > 10) {
          error = "Product Code must be 10 characters or less";
        }
        break;
      case "ProductName":
        if (value && value.length > 255) {
          error = "Product Name must be 255 characters or less";
        }
        break;
      case "ListPrice":
        if (value && (isNaN(value) || parseFloat(value) < 0)) {
          error = "List Price must be a positive number";
        }
        break;
      case "DiscountPercent":
        if (value) {
          const discount = parseFloat(value);
          if (isNaN(discount) || discount < 0 || discount > 100) {
            error = "Discount must be between 0 and 100";
          }
        }
        break;
      case "QuantityOnHand":
        if (value && (isNaN(value) || parseInt(value) < 0)) {
          error = "Quantity must be a non-negative number";
        }
        break;
      case "Description":
        // No specific character limit for VARCHAR(MAX), but provide guidance
        if (value && value.length > 2000) {
          error = "Description is getting very long (over 2000 characters)";
        }
        break;
      default:
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!form.ProductCode || form.ProductCode.trim() === "") {
      newErrors.ProductCode = "Product Code is required";
    } else if (form.ProductCode.length > 10) {
      newErrors.ProductCode = "Product Code must be 10 characters or less";
    }

    if (!form.ProductName || form.ProductName.trim() === "") {
      newErrors.ProductName = "Product Name is required";
    } else if (form.ProductName.length > 255) {
      newErrors.ProductName = "Product Name must be 255 characters or less";
    }

    if (!form.CategoryID) {
      newErrors.CategoryID = "Category is required";
    }

    if (!form.ListPrice || form.ListPrice === "") {
      newErrors.ListPrice = "List Price is required";
    } else if (isNaN(form.ListPrice) || parseFloat(form.ListPrice) <= 0) {
      newErrors.ListPrice = "List Price must be a positive number";
    }

    if (form.DiscountPercent && form.DiscountPercent !== "") {
      const discount = parseFloat(form.DiscountPercent);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        newErrors.DiscountPercent = "Discount must be between 0 and 100";
      }
    }

    if (form.Description && form.Description.length > 2000) {
      newErrors.Description = "Description should not exceed 2000 characters";
    }

    if (form.QuantityOnHand !== "" && (isNaN(form.QuantityOnHand) || parseInt(form.QuantityOnHand) < 0)) {
      newErrors.QuantityOnHand = "Quantity must be a non-negative number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          image: "Image file size must be less than 5MB"
        });
        return;
      }

      setSelectedImage(file);
      setHasUnsavedChanges(true);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Clear image error if it exists
      if (errors.image) {
        setErrors({
          ...errors,
          image: "",
        });
      }
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    // Get category name from the selected CategoryID
    const category = categories.find(c => c.CategoryID === parseInt(form.CategoryID));
    const categoryName = category?.CategoryName || "Guitars";

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("categoryName", categoryName);

    try {
      const response = await fetch("http://localhost:5077/api/products/upload-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl;
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Create preview product object (NOT saved to database yet)
    const category = categories.find(c => c.CategoryID === parseInt(form.CategoryID));
    const previewData = {
      productID: form.ProductID,
      productCode: form.ProductCode,
      productName: form.ProductName,
      categoryName: category?.CategoryName || "",
      listPrice: parseFloat(form.ListPrice),
      discountPercent: parseFloat(form.DiscountPercent),
      description: form.Description,
      imageURL: imagePreview, // Use the preview URL
      quantityOnHand: parseInt(form.QuantityOnHand),
      isActive: true
    };
    
    setPreviewProduct(previewData);
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    try {
      // Upload image first if there's a new one
      let imageUrl = form.ImageURL;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      // Update form with the uploaded image URL
      const productData = {
        ...form,
        ImageURL: imageUrl || form.ImageURL,
      };

      const endpoint = isEditing
        ? `http://localhost:5077/api/products/${form.ProductID}`
        : "http://localhost:5077/api/products";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        setShowPreview(false);
        alert(isEditing ? "Product updated successfully!" : "Product added successfully!");
        onClose(true); // Close and refresh product list
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  const handleBackToEdit = () => {
    setShowPreview(false);
    // Form data is preserved, user can continue editing
  };

  const handlePreviewClose = () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel? The product has not been saved yet."
    );
    if (confirmed) {
      setShowPreview(false);
      onClose(false); // Close without refreshing
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Are you sure you want to cancel? All product information will be discarded."
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle clicking outside the modal
  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      handleClose();
    }
  };

  const incrementQuantity = () => {
    setForm({
      ...form,
      QuantityOnHand: parseInt(form.QuantityOnHand || 0) + 1
    });
    setHasUnsavedChanges(true);
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(form.QuantityOnHand || 0);
    if (currentQty > 0) {
      setForm({
        ...form,
        QuantityOnHand: currentQty - 1
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) {
      return;
    }

    try {
      const response = await fetch("https://localhost:7240/api/products/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ProductID: form.ProductID }),
      });

      if (response.ok) {
        alert("Product deactivated successfully!");
        setHasUnsavedChanges(false);
        onClose(true);
      } else {
        const errorData = await response.json();
        console.error("Error deactivating product:", errorData);
        alert(`Error: ${errorData.message || "Failed to deactivate product"}`);
      }
    } catch (error) {
      console.error("Error deactivating product:", error);
      alert("Failed to deactivate product. Please try again.");
    }
  };

  // Show preview modal before saving
  if (showPreview && previewProduct) {
    return (
      <div className="modal-overlay" onClick={handlePreviewClose}>
        <div 
          className="modal-content wide" 
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '900px', width: '90vw' }}
        >
          {/* Header with Product Name and Action Buttons */}
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
              {isEditing ? "Review Product Updates" : "Review New Product"}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                className="dashboard-btn dashboard-btn-success" 
                onClick={handleConfirmSave}
                style={{ fontSize: '0.9rem', padding: '8px 16px', fontWeight: '600' }}
              >
                {isEditing ? "Confirm & Update" : "Confirm & Add"}
              </button>
              <button
                className="dashboard-btn"
                onClick={handleBackToEdit}
                style={{ fontSize: '0.9rem', padding: '8px 16px' }}
              >
                Back to Edit
              </button>
              <button className="modal-close" onClick={handlePreviewClose} style={{ marginLeft: '10px' }}>×</button>
            </div>
          </div>

          <div className="modal-body" style={{ padding: '20px 0' }}>
            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              {/* Left Side - Product Information */}
              <div>
                {/* Product Details Section */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    Product Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 20px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Product Code:
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                        {previewProduct.productCode}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Category:
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                        {previewProduct.categoryName}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Product Name:
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                        {previewProduct.productName}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Quantity On Hand:
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                        {previewProduct.quantityOnHand}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Information Section */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    Pricing Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        List Price:
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                        ${previewProduct.listPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Discount:
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                        {previewProduct.discountPercent.toFixed(0)}%
                      </div>
                    </div>
                    {previewProduct.discountPercent > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                          Sale Price:
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                          ${(previewProduct.listPrice * (1 - previewProduct.discountPercent / 100)).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                {previewProduct.description && (
                  <div>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#374151', 
                      marginBottom: '10px',
                      paddingBottom: '8px',
                      borderBottom: '2px solid #e5e7eb'
                    }}>
                      Description
                    </h3>
                    <p style={{ 
                      fontSize: '0.95rem',
                      lineHeight: '1.6', 
                      color: '#4b5563',
                      margin: 0,
                      whiteSpace: 'pre-line'
                    }}>
                      {previewProduct.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side - Product Image */}
              <div>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Product Image
                </h3>
                {previewProduct.imageURL ? (
                  <img
                    src={previewProduct.imageURL}
                    alt={previewProduct.productName}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: previewProduct.imageURL ? 'none' : 'flex',
                    width: '100%',
                    height: '300px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db',
                    color: '#9ca3af',
                    fontSize: '0.95rem'
                  }}
                >
                  No Image Selected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" style={{ width: "600px", maxWidth: "90vw" }}>

        <h2 className="modal-title">
          {isEditing ? "Edit Product" : "Add Product"}
        </h2>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* Product Code */}
            <div className="form-field">
              <label className="form-label">Product Code *</label>
              <input
                className={`dashboard-input ${errors.ProductCode ? "input-error" : ""}`}
                name="ProductCode"
                placeholder="e.g., GTR001"
                value={form.ProductCode}
                onChange={handleChange}
                maxLength="10"
                required
                disabled={isEditing}
                style={isEditing ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" } : {}}
              />
              {errors.ProductCode && (
                <span className="error-message">{errors.ProductCode}</span>
              )}
              {!isEditing && (
                <span className="character-count">{form.ProductCode.length}/10</span>
              )}
            </div>

            {/* Product Name */}
            <div className="form-field">
              <label className="form-label">Product Name *</label>
              <input
                className={`dashboard-input ${errors.ProductName ? "input-error" : ""}`}
                name="ProductName"
                placeholder="e.g., Fender Stratocaster"
                value={form.ProductName}
                onChange={handleChange}
                maxLength="255"
                required
                disabled={isEditing}
                style={isEditing ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" } : {}}
              />
              {errors.ProductName && (
                <span className="error-message">{errors.ProductName}</span>
              )}
              {!isEditing && (
                <span className="character-count">{form.ProductName.length}/255</span>
              )}
            </div>

            {/* Category */}
            <div className="form-field">
              <label className="form-label">Category *</label>
              <select
                className={`dashboard-input ${errors.CategoryID ? "input-error" : ""}`}
                name="CategoryID"
                value={form.CategoryID}
                onChange={handleChange}
                required
                disabled={isEditing}
                style={isEditing ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" } : {}}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.CategoryID} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>
              {errors.CategoryID && (
                <span className="error-message">{errors.CategoryID}</span>
              )}
            </div>

            {/* List Price */}
            <div className="form-field">
              <label className="form-label">List Price *</label>
              <input
                className={`dashboard-input ${errors.ListPrice ? "input-error" : ""}`}
                name="ListPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 99.99"
                value={form.ListPrice}
                onChange={handleChange}
                required
              />
              {errors.ListPrice && (
                <span className="error-message">{errors.ListPrice}</span>
              )}
            </div>

            {/* Discount Percent */}
            <div className="form-field">
              <label className="form-label">Discount Percent</label>
              <input
                className={`dashboard-input ${errors.DiscountPercent ? "input-error" : ""}`}
                name="DiscountPercent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g., 15"
                value={form.DiscountPercent}
                onChange={handleChange}
              />
              {errors.DiscountPercent && (
                <span className="error-message">{errors.DiscountPercent}</span>
              )}
            </div>

            {/* Quantity On Hand */}
            <div className="form-field">
              <label className="form-label">Quantity On Hand *</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={decrementQuantity}
                  className="quantity-btn"
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280"
                  }}
                >
                  −
                </button>
                <input
                  className={`dashboard-input ${errors.QuantityOnHand ? "input-error" : ""}`}
                  name="QuantityOnHand"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  value={form.QuantityOnHand}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={incrementQuantity}
                  className="quantity-btn"
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6b7280"
                  }}
                >
                  +
                </button>
              </div>
              {errors.QuantityOnHand && (
                <span className="error-message">{errors.QuantityOnHand}</span>
              )}
            </div>

            {/* Image Upload Section */}
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Product Image</label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="dashboard-input"
              />
              <span style={{ fontSize: "0.75rem", color: "#6c757d", display: "block", marginTop: "4px" }}>
                Max 5MB - JPEG, PNG, GIF, WebP
              </span>
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
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

            {/* Description */}
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Description</label>
              <textarea
                className={`dashboard-input ${errors.Description ? "input-error" : ""}`}
                name="Description"
                placeholder="Product description (optional)"
                value={form.Description}
                onChange={handleChange}
                rows={4}
              />
              {errors.Description && (
                <span className="error-message">{errors.Description}</span>
              )}
              <span className="character-count">{form.Description.length} characters</span>
            </div>
          </div>

          <div className="modal-buttons">
            <button type="submit" className="dashboard-btn dashboard-btn-success">
              Review Product
            </button>

            {isEditing && (
              <button 
                type="button" 
                className="dashboard-btn dashboard-btn-warning" 
                onClick={handleDeactivate}
                style={{ backgroundColor: "#f59e0b", color: "white" }}
              >
                Deactivate Product
              </button>
            )}

            <button type="button" className="dashboard-btn dashboard-btn-danger" onClick={handleClose}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
