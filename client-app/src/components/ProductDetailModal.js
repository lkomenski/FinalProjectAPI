import React from "react";
import "../Styles/modal.css";

export default function ProductDetailModal({ product, onClose, onEdit, onToggleStatus }) {
  const money = (num) => (typeof num === "number" ? num.toFixed(2) : "0.00");

  // Debug: Log the product to see what we're receiving
  console.log("Product data:", product);

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
    
    console.log("Original ImageURL:", imageUrl);
    
    // Images are in the React public folder, so they're served from root
    // The imageURL from API is already in the correct format: /images/guitars/strat.jpg
    // Just use it directly since it's relative to the React app's public folder
    const fullUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    console.log("Image path:", fullUrl);
    return fullUrl;
  };

  // Get category name (handle both PascalCase and camelCase)
  const getCategoryName = () => {
    return product.categoryName || product.CategoryName || "Uncategorized";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content wide" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '900px', width: '90vw' }}
      >
        {/* Header with Product Name and Action Buttons */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>{product.productName || product.ProductName}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="dashboard-btn" onClick={onEdit} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
              Edit
            </button>
            {product.isActive ? (
              <button
                className="dashboard-btn dashboard-btn-warning"
                onClick={() => onToggleStatus(product.productID, false)}
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="dashboard-btn dashboard-btn-success"
                onClick={() => onToggleStatus(product.productID, true)}
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
              >
                Activate
              </button>
            )}
            <button className="modal-close" onClick={onClose} style={{ marginLeft: '10px' }}>×</button>
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
                      {product.productCode || product.ProductCode}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                      Category:
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                      {getCategoryName()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                      Product ID:
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#1f2937' }}>
                      {product.productID || product.ProductID}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                      Status:
                    </div>
                    <span className={product.isActive || product.IsActive ? "status-active" : "status-inactive"}>
                      {product.isActive || product.IsActive ? "Active" : "Inactive"}
                    </span>
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
                      ${money(product.listPrice || product.ListPrice)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                      Discount:
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                      {(product.discountPercent || product.DiscountPercent || 0).toFixed(0)}%
                    </div>
                  </div>
                  {(product.discountPercent || product.DiscountPercent) > 0 && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '3px' }}>
                        Sale Price:
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                        ${money((product.listPrice || product.ListPrice) * (1 - ((product.discountPercent || product.DiscountPercent) || 0) / 100))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section */}
              {(product.description || product.Description) && (
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
                    {cleanDescription(product.description || product.Description)}
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
              {getImageSrc() ? (
                <img
                  src={getImageSrc()}
                  alt={product.productName || product.ProductName}
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
                    console.error("Image failed to load:", getImageSrc());
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  display: getImageSrc() ? 'none' : 'flex',
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
                No Image Available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
