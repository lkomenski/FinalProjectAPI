import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./HomePage.css";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load Recently Viewed Items
  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed");
    if (stored) setRecentlyViewed(JSON.parse(stored));
  }, []);

  // -----------------------------
  // LOAD PRODUCTS + CATEGORIES
  // -----------------------------
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

        // FEATURED = first 4 active items
        setFeatured(productData.filter(p => p.isActive).slice(0, 4));

        // BEST SELLERS (sorted by quantity sold)
        setBestSellers(
          [...productData]
            .filter(p => p.totalSold !== undefined)
            .sort((a, b) => b.totalSold - a.totalSold)
            .slice(0, 4)
        );

      } catch (err) {
        setError("Error loading data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // -----------------------------
  // SEARCH + CATEGORY FILTERING
  // -----------------------------
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.categoryID === parseInt(selectedCategory)
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);


  if (loading) {
    return <div className="homepage-loading">Loading products...</div>;
  }

  if (error) {
    return <div className="homepage-error">{error}</div>;
  }

  return (
    <div className="homepage-container">
      
      {/* -------------------------------- */}
      {/* HERO CAROUSEL                    */}
      {/* -------------------------------- */}
      <div className="carousel-container">
        <div className="carousel-slide">
          <img src="/hero1.jpg" alt="Hero 1" />
        </div>
        <div className="carousel-slide">
          <img src="/hero2.jpg" alt="Hero 2" />
        </div>
        <div className="carousel-slide">
          <img src="/hero3.jpg" alt="Hero 3" />
        </div>

        <div className="carousel-overlay">
          <h1>Find Your Sound</h1>
          <p>Premium guitars, accessories & more.</p>

          <input
            className="hero-search"
            type="text"
            placeholder="Search guitars, amps, pedals…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* -------------------------------- */}
      {/* CATEGORY STRIP                   */}
      {/* -------------------------------- */}
      <div className="category-strip">
        <button
          className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
          onClick={() => setSelectedCategory("")}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c.categoryID}
            className={`category-btn ${
              selectedCategory === String(c.categoryID) ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(String(c.categoryID))}
          >
            {c.categoryName}
          </button>
        ))}
      </div>

      {/* -------------------------------- */}
      {/* FEATURED CATEGORIES              */}
      {/* -------------------------------- */}
      <h2 className="section-title">Shop by Category</h2>
      <div className="featured-category-grid">
        {categories.map((c) => (
          <div
            key={c.categoryID}
            className="featured-category-card"
            onClick={() => setSelectedCategory(String(c.categoryID))}
          >
            <div className="featured-category-img">
              <img src={`/category-icons/${c.categoryID}.png`} alt="" />
            </div>
            <p>{c.categoryName}</p>
          </div>
        ))}
      </div>

      {/* -------------------------------- */}
      {/* FEATURED PRODUCTS                */}
      {/* -------------------------------- */}
      <h2 className="section-title">Featured Products ⭐</h2>

      <div className="product-grid">
        {featured.map((p) => (
          <ProductCard key={p.productID} product={p} />
        ))}
      </div>

      {/* -------------------------------- */}
      {/* BEST SELLERS                     */}
      {/* -------------------------------- */}
      <h2 className="section-title">Best Sellers 🔥</h2>

      <div className="product-grid">
        {bestSellers.map((p) => (
          <ProductCard key={p.productID} product={p} />
        ))}
      </div>

      {/* -------------------------------- */}
      {/* RECENTLY VIEWED                  */}
      {/* -------------------------------- */}
      {recentlyViewed.length > 0 && (
        <>
          <h2 className="section-title">Recently Viewed 👀</h2>
          <div className="product-grid">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.productID} product={p} />
            ))}
          </div>
        </>
      )}

      {/* -------------------------------- */}
      {/* ALL PRODUCTS                     */}
      {/* -------------------------------- */}
      <h2 className="section-title">Browse All Products</h2>

      {filteredProducts.length === 0 ? (
        <p className="no-results">No products match your search.</p>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((p) => (
            <ProductCard key={p.productID} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
