import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import { fetchData } from "./Api";
import { CartContext } from "../context/CartContext";
import "../Styles/ProductDetails.css";   // ⭐ NEW STYLING FILE

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
          src={product.imageURL || "/placeholder.png"}
          alt={product.productName}
        />
      </div>

      {/* ------- INFO SECTION ------- */}
      <div className="product-details-info">
        <h1 className="product-title">{product.productName}</h1>

        <p className="product-price">
          ${product.listPrice?.toFixed(2)}
        </p>

        <p className="product-category">
          Category: <span>{product.categoryName}</span>
        </p>

        {product.discountPercent > 0 && (
          <p className="product-discount">
            Save {product.discountPercent}% Today!
          </p>
        )}

        <p className="product-description">
          {product.description || "No description available."}
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
