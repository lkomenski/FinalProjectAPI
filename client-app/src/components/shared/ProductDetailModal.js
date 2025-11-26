import React from "react";
import "../../Styles/modal.css";

export default function ProductDetailModal({ product, onClose, onEdit, onToggleStatus }) {
  const money = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  // Clean up description by removing HTML entities and extra characters
  const cleanDescription = (desc) => {
    if (!desc) return "";
    return desc
      // First handle escape sequences
      .replace(/\\r\\n/g, '\n')  // Replace \r\n with actual newlines
      .replace(/\\n/g, '\n')      // Replace \n with actual newlines
      .replace(/\\r/g, '\n')      // Replace \r with actual newlines
      .replace(/\\t/g, ' ')       // Replace \t with space
      // Then handle HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove control characters
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Clean up multiple newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  // Get proper image path - images are served by React app from /public/images
  const getImageSrc = () => {
    const imageUrl = product.imageURL || product.ImageURL;
    if (!imageUrl) return null;
    
    // Images are in the React public folder, so they're served from root
    // The imageURL from API is already in the correct format: /images/guitars/strat.jpg
    // Just use it directly since it's relative to the React app's public folder
    const fullUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return fullUrl;
  };

  // Get category name (handle both PascalCase and camelCase)
  const getCategoryName = () => {
    return product.categoryName || product.CategoryName || "Uncategorized";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content wide product-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Product Name and Action Buttons */}
        <div className="modal-header product-modal-header">
          <h2 className="product-modal-title">{product.productName || product.ProductName}</h2>
          <div className="product-modal-actions">
            <button className="dashboard-btn product-action-btn" onClick={onEdit}>
              Edit
            </button>
            {product.isActive ? (
              <button
                className="dashboard-btn dashboard-btn-warning product-action-btn"
                onClick={() => onToggleStatus(product.productID, false)}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="dashboard-btn dashboard-btn-success product-action-btn"
                onClick={() => onToggleStatus(product.productID, true)}
              >
                Activate
              </button>
            )}
            <button className="modal-close product-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="modal-body product-modal-body">
          {/* Main Content Grid */}
          <div className="product-main-grid">
            {/* Left Side - Product Information */}
            <div>
              {/* Product Details Section */}
              <div className="product-section">
                <h3 className="product-section-title">
                  Product Details
                </h3>
                <div className="product-details-grid">
                  <div className="product-detail-item">
                    <div className="product-detail-label">
                      Product Code:
                    </div>
                    <div className="product-detail-value">
                      {product.productCode || product.ProductCode}
                    </div>
                  </div>
                  <div className="product-detail-item">
                    <div className="product-detail-label">
                      Category:
                    </div>
                    <div className="product-detail-value">
                      {getCategoryName()}
                    </div>
                  </div>
                  <div className="product-detail-item">
                    <div className="product-detail-label">
                      Product ID:
                    </div>
                    <div className="product-detail-value">
                      {product.productID || product.ProductID}
                    </div>
                  </div>
                  <div className="product-detail-item">
                    <div className="product-detail-label">
                      Status:
                    </div>
                    <span className={product.isActive || product.IsActive ? "status-active" : "status-inactive"}>
                      {product.isActive || product.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information Section */}
              <div className="product-section">
                <h3 className="product-section-title">
                  Pricing Information
                </h3>
                <div className="product-pricing-grid">
                  <div className="product-price-item">
                    <div className="product-price-label">
                      List Price:
                    </div>
                    <div className="product-list-price">
                      ${money(product.listPrice || product.ListPrice)}
                    </div>
                  </div>
                  <div className="product-price-item">
                    <div className="product-price-label">
                      Discount:
                    </div>
                    <div className="product-discount-value">
                      {(product.discountPercent || product.DiscountPercent || 0).toFixed(0)}%
                    </div>
                  </div>
                  {(product.discountPercent || product.DiscountPercent) > 0 && (
                    <div className="product-price-item">
                      <div className="product-price-label">
                        Sale Price:
                      </div>
                      <div className="product-sale-price">
                        ${money((product.listPrice || product.ListPrice) * (1 - ((product.discountPercent || product.DiscountPercent) || 0) / 100))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {(product.description || product.Description) && (
                <div className="product-section">
                  <h3 className="product-section-title">
                    Description
                  </h3>
                  <p className="product-description">
                    {cleanDescription(product.description || product.Description)}
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Product Image */}
            <div>
              <h3 className="product-section-title">
                Product Image
              </h3>
              {getImageSrc() ? (
                <img
                  src={getImageSrc()}
                  alt={product.productName || product.ProductName}
                  className="product-image"
                  onError={(e) => {
                    console.error("Image failed to load:", getImageSrc());
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={getImageSrc() ? "product-no-image-hidden" : "product-no-image"}
              >
                No Image Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
