import React from "react";
import "./ProductCard.css";

import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.productID}`} className="product-card">
      <img src={product.imageUrl || "/placeholder.png"} alt={product.productName} />
      <h3>{product.productName}</h3>
      <p>${product.listPrice?.toFixed(2)}</p>
    </Link>
  );
}

export default ProductCard;