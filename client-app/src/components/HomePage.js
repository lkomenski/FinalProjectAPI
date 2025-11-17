import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Slider from "react-slick";
import "./HomePage.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 }},
      { breakpoint: 900, settings: { slidesToShow: 2 }},
      { breakpoint: 600, settings: { slidesToShow: 1 }},
    ],
  };

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
        const productRes = await fetch("http://localhost:5077/api/products");
        const categoryRes = await fetch("http://localhost:5077/api/categories");
        const featuredRes = await fetch("http://localhost:5077/api/products/featured");
        const bestRes = await fetch("http://localhost:5077/api/products/best-sellers");

        if (!productRes.ok || !categoryRes.ok || !featuredRes.ok || !bestRes.ok)
          throw new Error("Failed to load data");

        const productData = await productRes.json();
        const categoryData = await categoryRes.json();
        const featuredData = await featuredRes.json();
        const bestSellerData = await bestRes.json();

        setProducts(productData);
        setFilteredProducts(productData);
        setCategories(categoryData);
        setFeatured(featuredData);
        setBestSellers(bestSellerData);
      } catch (err) {
        console.error(err);
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
        <div className="carousel-slide"><img src="/images/hero1.jpg" alt="Hero banner 1" /></div>
        <div className="carousel-slide"><img src="/images/hero2.jpg" alt="Hero banner 2" /></div>

        <div className="carousel-overlay">
          <h1>Find Your Sound</h1>
          <p>Premium guitars, accessories & more.</p>
          <input
            className="hero-search"
            type="text"
            placeholder="Search guitars, drums, basses…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* -------------------------------- */}
      {/* FEATURED PRODUCTS CAROUSEL       */}
      {/* -------------------------------- */}
      <h2 className="section-title">Featured Products ⭐</h2>

      {featured.length > 0 ? (
        <Slider {...sliderSettings} className="product-slider">
          {featured.map((p) => (
            <div key={p.productID}>
              <ProductCard product={p} />
            </div>
          ))}
        </Slider>
      ) : (
        <p>No featured products available.</p>
      )}

      {/* -------------------------------- */}
      {/* BEST SELLERS CAROUSEL            */}
      {/* -------------------------------- */}
      <h2 className="section-title">Best Sellers 🔥</h2>

      {bestSellers.length > 0 ? (
        <Slider {...sliderSettings} className="product-slider">
          {bestSellers.map((p) => (
            <div key={p.productID}>
              <ProductCard product={p} />
            </div>
          ))}
        </Slider>
      ) : (
        <p>No best sellers available.</p>
      )}

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
      {/* PRODUCT BROWSING SECTION          */}
      {/* -------------------------------- */}
      
      {/* Category Filtering Controls */}
      <div className="product-browse-header">
        <div className="browse-title-section">
          <h2 className="section-title">
            {selectedCategory === "" 
              ? "Browse All Products" 
              : `Viewing All ${categories.find(c => c.categoryID === parseInt(selectedCategory))?.categoryName || 'Products'}`
            }
          </h2>
        </div>
        
        <div className="category-filter-section">
          <span className="filter-label">Filter by category:</span>
          <div className="category-buttons">
            <button
              className={`category-btn ${selectedCategory === "" ? "active" : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              All Products
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
        </div>
      </div>

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
