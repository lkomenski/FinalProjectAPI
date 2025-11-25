import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import ProductForm from "./ProductForm";
import ProductDetailModal from "./ProductDetailModal";
import "../../Styles/Dashboard.css";
import "../../Styles/ManagementPage.css";

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailProductId, setDetailProductId] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    loadProducts();
    loadFeaturedAndBestSellers();
  }, []);

  async function loadProducts() {
    try {
      const data = await fetchData("products");
      console.log("Products loaded:", data);
      console.log("First product:", data[0]);
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFeaturedAndBestSellers() {
    try {
      const featured = await fetchData("products/featured");
      const bestSellers = await fetchData("products/best-sellers");
      console.log("Featured products response:", featured);
      console.log("Best sellers response:", bestSellers);
      
      // Normalize the data to camelCase since the API returns PascalCase for these endpoints
      const normalizeFeatured = featured.map(p => ({
        productID: p.ProductID || p.productID,
        productCode: p.ProductCode || p.productCode,
        productName: p.ProductName || p.productName,
        categoryID: p.CategoryID || p.categoryID,
        listPrice: p.ListPrice || p.listPrice,
        discountPercent: p.DiscountPercent || p.discountPercent,
        imageURL: p.ImageURL || p.imageURL,
        isActive: p.IsActive !== undefined ? p.IsActive : p.isActive,
        quantityOnHand: p.QuantityOnHand !== undefined ? p.QuantityOnHand : p.quantityOnHand
      }));
      
      const normalizeBestSellers = bestSellers.map(p => ({
        productID: p.ProductID || p.productID,
        productCode: p.ProductCode || p.productCode,
        productName: p.ProductName || p.productName,
        categoryID: p.CategoryID || p.categoryID,
        listPrice: p.ListPrice || p.listPrice,
        discountPercent: p.DiscountPercent || p.discountPercent,
        imageURL: p.ImageURL || p.imageURL,
        isActive: p.IsActive !== undefined ? p.IsActive : p.isActive,
        quantityOnHand: p.QuantityOnHand !== undefined ? p.QuantityOnHand : p.quantityOnHand
      }));
      
      setFeaturedProducts(Array.isArray(normalizeFeatured) ? normalizeFeatured : []);
      setBestSellers(Array.isArray(normalizeBestSellers) ? normalizeBestSellers : []);
    } catch (err) {
      console.error("Failed to load featured/best sellers:", err);
      setFeaturedProducts([]);
      setBestSellers([]);
    }
  }

  // Product filtering
  useEffect(() => {
    let list = [...products];

    if (productFilter === "active") list = list.filter(p => p.isActive);
    if (productFilter === "inactive") list = list.filter(p => !p.isActive);

    if (productSearch.trim() !== "") {
      const s = productSearch.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(s));
    }

    if (productSort) {
      list.sort((a, b) => (a[productSort] > b[productSort] ? 1 : -1));
    }

    setFilteredProducts(list);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, productSearch, productSort, productFilter]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination items with ellipsis for large page counts
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 7; // Maximum page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at start
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      // Adjust if at end
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        items.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push('...');
      }
      
      // Always show last page
      items.push(totalPages);
    }
    
    return items;
  };

  async function activateProduct(id) {
    try {
      const response = await fetch(`http://localhost:5077/api/products/activate/${id}`, { 
        method: "PUT" 
      });
      
      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        if (responseData && responseData.message) {
          console.log(responseData.message);
        }
        loadProducts(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        alert(`Error activating product: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Error activating product:', error);
      alert('Failed to activate product. Please try again.');
    }
  }

  async function deactivateProduct(id) {
    try {
      const response = await fetch(`http://localhost:5077/api/products/deactivate/${id}`, { 
        method: "PUT" 
      });
      
      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        if (responseData && responseData.message) {
          console.log(responseData.message);
        }
        loadProducts(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        alert(`Error deactivating product: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
      alert('Failed to deactivate product. Please try again.');
    }
  }

  function truncateDescription(text, maxLength = 80) {
    if (!text) return "";
    const cleaned = text.replace(/\\r\\n|\\n/g, ' ').replace(/\s+/g, ' ').trim();
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + "..." : cleaned;
  }

  function getStockStatus(product) {
    const quantity = product.quantityOnHand || 0;
    if (quantity === 0) return { label: "Out of Stock", color: "#dc2626", bgColor: "#fef2f2", borderColor: "#fecaca" };
    if (quantity < 5) return { label: "Low Stock", color: "#d97706", bgColor: "#fffbeb", borderColor: "#fed7aa" };
    return { label: "In Stock", color: "#059669", bgColor: "#f0fdf4", borderColor: "#bbf7d0" };
  }

  function handleFormClose() {
    setSelectedProduct(null);
    setIsAddingProduct(false);
    loadProducts();
  }

  function openProductDetail(productId) {
    setDetailProductId(productId);
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setDetailProductId(null);
    loadProducts(); // Reload in case any changes were made
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const outOfStockProducts = products.filter(p => !p.quantityOnHand || p.quantityOnHand === 0);
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const avgPrice = products.length > 0 
    ? (products.reduce((sum, p) => sum + (p.listPrice || 0), 0) / products.length).toFixed(2)
    : "0.00";
  const lowStockCount = products.filter(p => p.quantityOnHand > 0 && p.quantityOnHand < 5).length;

  return (
    <>
    <div className="product-management-layout">
      {/* Left Panel - Product Lists */}
      <div className="product-left-panel">
        <div className="dashboard-card product-left-card">
          {/* Quick Tip */}
          <div className="product-quick-tip">
            <h4 className="product-quick-tip-title">
              Quick Tip
            </h4>
            <p className="product-quick-tip-text">
              Click on any product row to view details, edit, or manage status.
            </p>
          </div>

          {/* Featured Products */}
          <div className="product-featured-section">
            <h3 className="product-section-title">
              Featured Products
            </h3>
            {featuredProducts.length === 0 ? (
              <p className="product-no-data">No featured products</p>
            ) : (
              <div className="product-list">
                {featuredProducts.slice(0, 4).map(p => (
                  <div key={p.productID} className="product-item" onClick={() => openProductDetail(p.productID)}>
                    <div className="product-item-name">{p.productName}</div>
                    <div className="product-item-price-row">
                      <span className="product-item-price">${p.listPrice?.toFixed(2)}</span>
                      {p.discountPercent > 0 && (
                        <span className="product-item-discount">
                          {p.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Best Sellers */}
          <div className="product-best-sellers-section">
            <h3 className="product-section-title">
              Best Sellers
            </h3>
            {bestSellers.length === 0 ? (
              <p className="product-no-data">No sales data</p>
            ) : (
              <div className="product-list">
                {bestSellers.slice(0, 4).map(p => (
                  <div key={p.productID} className="product-item" onClick={() => openProductDetail(p.productID)}>
                    <div className="product-item-name">{p.productName}</div>
                    <div className="product-item-price">${p.listPrice?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of Stock */}
          <div>
            <h3 className="product-section-title">
              Out of Stock
            </h3>
            {outOfStockProducts.length === 0 ? (
              <p className="product-all-in-stock">All products in stock</p>
            ) : (
              <div className="product-list">
                {outOfStockProducts.slice(0, 4).map(p => (
                  <div key={p.productID} className="product-out-of-stock-item" onClick={() => openProductDetail(p.productID)}>
                    <div className="product-out-of-stock-name">{p.productName}</div>
                    <div className="product-out-of-stock-note">Needs restock</div>
                  </div>
                ))}
                {outOfStockProducts.length > 4 && (
                  <div className="product-out-of-stock-more">
                    +{outOfStockProducts.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="product-main-content">
    <div className="dashboard-container product-main-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Product Management</span>
      </div>

      <h2 className="dashboard-title">Product Management</h2>

      <div className="filters-row product-filters-row">
        <input 
          className="dashboard-input" 
          placeholder="Search products..." 
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)} 
        />

        <select className="dashboard-select" value={productSort} onChange={(e) => setProductSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="productName">Name</option>
          <option value="listPrice">Price</option>
          <option value="categoryID">Category</option>
          <option value="isActive">Status</option>
        </select>

        <select className="dashboard-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="">Show All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          className="dashboard-btn dashboard-btn-success"
          onClick={() => { setSelectedProduct(null); setIsAddingProduct(true); }}
        >
          + Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="product-list-section">
        {currentProducts.length === 0 ? (
          <p className="product-no-results">No products found.</p>
        ) : (
          currentProducts.map((p) => {
            const stock = getStockStatus(p);
            return (
            <div 
              key={p.productID} 
              className="dashboard-list-item product-list-item"
              onClick={() => openProductDetail(p.productID)}
            >
              {/* Image */}
              <div className="product-image-container">
                {p.imageURL ? (
                  <img
                    src={p.imageURL.startsWith('/') ? p.imageURL : `/${p.imageURL}`}
                    alt={p.productName}
                    className="product-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`product-image-placeholder ${p.imageURL ? 'hidden' : ''}`}
                >
                  N/A
                </div>
              </div>

              {/* Product Info */}
              <div className="product-info">
                <div className="product-info-name">
                  {p.productName}
                </div>
                <div className="product-info-category">
                  {p.categoryName || "Uncategorized"}
                </div>
                <div className="product-info-description">
                  {truncateDescription(p.description, 50)}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="product-price-label">
                  Price
                </div>
                <div className="product-price-value">
                  ${p.listPrice?.toFixed(2) || "0.00"}
                </div>
                {p.discountPercent > 0 && (
                  <div className="product-price-discount">
                    -{p.discountPercent}%
                  </div>
                )}
              </div>

              {/* Stock */}
              <div>
                <div className="product-stock-label">
                  Stock
                </div>
                <div className="product-stock-value" style={{ color: stock.color }}>
                  {p.quantityOnHand || 0}
                </div>
                <span
                  className="product-stock-badge"
                  style={{
                    backgroundColor: stock.bgColor,
                    color: stock.color,
                    border: `1px solid ${stock.borderColor}`
                  }}
                >
                  {stock.label}
                </span>
              </div>

              {/* Status */}
              <div>
                <div className="product-status-label">
                  Status
                </div>
                <span className={`${p.isActive ? "status-active" : "status-inactive"} product-status-badge`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-pages">
            {getPaginationItems().map((item, index) => (
              item === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={item}
                  className={`pagination-page ${currentPage === item ? 'active' : ''}`}
                  onClick={() => goToPage(item)}
                >
                  {item}
                </button>
              )
            ))}
          </div>

          <button 
            className="pagination-btn" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <div className="pagination-info">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
      </div>
    </div>
      </div>

      {/* Right Panel - Metrics */}
      <div className="product-right-panel">
        <div className="dashboard-card product-metrics-card">
          <h3 className="product-metrics-title">
            Product Metrics
          </h3>
          
          <div className="product-metrics-container">
            {/* Total Products */}
            <div>
              <div className="product-metric-label">
                Total Products
              </div>
              <div className="product-metric-value">
                {totalProducts}
              </div>
            </div>

            {/* Active Products */}
            <div>
              <div className="product-metric-label">
                Active
              </div>
              <div className="product-metric-value active">
                {activeProducts}
              </div>
            </div>

            {/* Average Price */}
            <div>
              <div className="product-metric-label">
                Average Price
              </div>
              <div className="product-metric-value price">
                ${avgPrice}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div>
              <div className="product-metric-label">
                Low Stock
              </div>
              <div className={`product-metric-value low-stock ${lowStockCount > 0 ? 'warning' : 'good'}`}>
                {lowStockCount}
              </div>
              <div className="product-metric-note">
                (&lt; 5 units)
              </div>
            </div>

            {/* Out of Stock */}
            <div>
              <div className="product-metric-label">
                Out of Stock
              </div>
              <div className={`product-metric-value out-of-stock ${outOfStockProducts.length > 0 ? 'warning' : 'good'}`}>
                {outOfStockProducts.length}
              </div>
            </div>

            {/* Inventory Health */}
            <div className="product-inventory-health">
              <div className="product-inventory-health-label">
                Inventory Health
              </div>
              <div className={`product-inventory-health-value ${
                outOfStockProducts.length === 0 && lowStockCount === 0 ? 'excellent' : 
                lowStockCount > 0 && outOfStockProducts.length === 0 ? 'fair' : 'attention'
              }`}>
                {outOfStockProducts.length === 0 && lowStockCount === 0 ? 'Excellent' : 
                 lowStockCount > 0 && outOfStockProducts.length === 0 ? 'Fair' : 'Needs Attention'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modals */}
      {(isAddingProduct || selectedProduct) && (
        <ProductForm
          product={selectedProduct}
          onClose={handleFormClose}
        />
      )}

      {showDetailModal && detailProductId && (
        <ProductDetailModal
          product={products.find(p => p.productID === detailProductId)}
          onClose={closeDetailModal}
          onEdit={() => {
            const product = products.find(p => p.productID === detailProductId);
            setSelectedProduct(product);
            setIsAddingProduct(false);
            setShowDetailModal(false);
          }}
          onToggleStatus={(id, activate) => {
            if (activate) {
              activateProduct(id);
            } else {
              deactivateProduct(id);
            }
            closeDetailModal();
          }}
        />
      )}
    </>
  );
}
