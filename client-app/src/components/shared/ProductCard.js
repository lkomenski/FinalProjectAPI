import React from "react";
import "../Styles/ProductCard.css";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
  // Determine user role
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === "admin";

  // Determine CSS fade class
  const isInactive = !product.isActive && !product.IsActive;
  const fadeClass = isInactive ? "inactive-product" : "";

  // Customers cannot click inactive products
  const clickable = isAdmin || !isInactive;

  const cardContent = (
    <div className={`product-card ${fadeClass}`}>
      <img
        src={product.imageURL || product.ImageURL || "/placeholder.png"}
        alt={product.productName || product.ProductName}
      />

      <h3>{product.productName || product.ProductName}</h3>

      <p>${(product.listPrice || product.ListPrice)?.toFixed(2)}</p>

      {/* INACTIVE badge */}
      {isInactive && (
        <span className="inactive-label">INACTIVE</span>
      )}
    </div>
  );

  // If clickable → wrap with Link
  // If NOT clickable → return plain card div
  return clickable ? (
    <Link to={`/product/${product.productID || product.ProductID}`} className="no-underline">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}

export default ProductCard;
