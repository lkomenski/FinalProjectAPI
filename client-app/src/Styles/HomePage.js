import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [error, setError] = useState("");

  // NEW — admin-only toggle
  const [showInactive, setShowInactive] = useState(false);

  // detect logged-in user & role
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch("https://localhost:5001/api/products");
        const categoryRes = await fetch("https://localhost:5001/api/categories");

        if (!productRes.ok || !categoryRes.ok)
          throw new Error("Failed to load data");

        const productData = await productRes.json();
        const categoryData = await categoryRes.json();

        // Customers ONLY see active products
        if (!isAdmin) {
          const activeOnly = productData.filter((p) => p.isActive);
          setProducts(activeOnly);
          setFilteredProducts(activeOnly);
        } else {
          // Admin sees everything (toggle applied in separate effect)
          setProducts(productData);
          setFilteredProducts(productData);
        }

        setCategories(categoryData);
      } catch (err) {
        setError("Error loading data. Please try again later.");
      }
    };

    fetchData();
  }, [isAdmin]);

  // Apply search, category filter, and active toggle (admin only)
  useEffect(() => {
    let filtered = [...products];

    // Admin toggle: hide inactive if switch OFF
    if (isAdmin && !showInactive) {
      filtered = filtered.filter((p) => p.isActive);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.categoryID === parseInt(selectedCategory)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products, showInactive, isAdmin]);

  return (
    <div className="homepage">
      <h1>Shop Our Guitars 🎶</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ADMIN-ONLY TOGGLE */}
      {isAdmin && (
        <div className="admin-toggle">
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={() => setShowInactive(!showInactive)}
            />
            <span style={{ marginLeft: "8px" }}>
              Show inactive products (admin only)
            </span>
          </label>
        </div>
      )}

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((p) => (
          <ProductCard key={p.productID} product={p} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
