import React from "react";
import "./ProductCard.css";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl || "/placeholder.png"} alt={product.productName} />
      <h3>{product.productName}</h3>
      <p>${product.listPrice?.toFixed(2)}</p>
      <button>Add to Cart</button>
    </div>
  );
}

export default ProductCard;
