import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import NavigationBar from "./NavigationBar";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch("https://localhost:5001/api/products");
        const categoryRes = await fetch("https://localhost:5001/api/categories");

        if (!productRes.ok || !categoryRes.ok)
          throw new Error("Failed to load data");

        const productData = await productRes.json();
        const categoryData = await categoryRes.json();

        setProducts(productData);
        setFilteredProducts(productData);
        setCategories(categoryData);
      } catch (err) {
        setError("Error loading data. Please try again later.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryID === parseInt(selectedCategory));
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  return (
    <>
      <NavigationBar />
      <div className="homepage">
        <h1>Shop Our Guitars 🎶</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}

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
            {categories.map(c => (
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
    </>
  );
}

export default HomePage;
