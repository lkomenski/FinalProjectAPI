import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://localhost:5001/api/products");
        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError("Error loading products. Please try again later.");
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="homepage">
      <h1>Welcome to My Guitar Shop</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.productId} product={p} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
