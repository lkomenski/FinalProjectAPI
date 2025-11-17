import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import { fetchData } from "./Api";
import { CartContext } from "../context/CartContext";
import "../Styles/ProductDetails.css";  

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchData(`products/${productId}`);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!product) return <ErrorMessage message="Product not found." />;

  return (
    <div className="product-details-container">
      {/* ------- IMAGE SECTION ------- */}
      <div className="product-details-image">
        <img
          src={product.imageURL || product.ImageURL || "/placeholder.png"}
          alt={product.productName || product.ProductName}
        />
      </div>

      {/* ------- INFO SECTION ------- */}
      <div className="product-details-info">
        <h1 className="product-title">{product.productName || product.ProductName}</h1>

        <p className="product-price">
          ${(product.listPrice || product.ListPrice)?.toFixed(2)}
        </p>

        {(product.categoryName || product.CategoryName) && (
          <p className="product-category">
            Category: <span>{product.categoryName || product.CategoryName}</span>
          </p>
        )}

        {(product.discountPercent || product.DiscountPercent) > 0 && (
          <p className="product-discount">
            Save {product.discountPercent || product.DiscountPercent}% Today!
          </p>
        )}

        <p className="product-description">
          {(product.description || product.Description || "No description available.")
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')}
        </p>

        <button
          className="product-add-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
