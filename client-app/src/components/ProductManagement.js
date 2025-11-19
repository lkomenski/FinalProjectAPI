import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import ProductForm from "./ProductForm";
import ProductDetailModal from "./ProductDetailModal";
import "../Styles/Dashboard.css";

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

  async function activateProduct(id) {
    await fetch(`http://localhost:5077/api/products/activate/${id}`, { method: "PUT" });
    loadProducts();
  }

  async function deactivateProduct(id) {
    await fetch(`http://localhost:5077/api/products/deactivate/${id}`, { method: "PUT" });
    loadProducts();
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
    <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Product Lists */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          {/* Quick Tip */}
          <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af' }}>
              Quick Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', lineHeight: '1.4' }}>
              Click on any product row to view details, edit, or manage status.
            </p>
          </div>

          {/* Featured Products */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
              Featured Products
            </h3>
            {featuredProducts.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>No featured products</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {featuredProducts.slice(0, 4).map(p => (
                  <div key={p.productID} style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px', fontSize: '0.85rem' }}>{p.productName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#059669', fontWeight: '600' }}>${p.listPrice?.toFixed(2)}</span>
                      {p.discountPercent > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>
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
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
              Best Sellers
            </h3>
            {bestSellers.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>No sales data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bestSellers.slice(0, 4).map(p => (
                  <div key={p.productID} style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px', fontSize: '0.85rem' }}>{p.productName}</div>
                    <div style={{ color: '#059669', fontWeight: '600' }}>${p.listPrice?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of Stock */}
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
              Out of Stock
            </h3>
            {outOfStockProducts.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#059669', margin: 0 }}>All products in stock</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {outOfStockProducts.slice(0, 4).map(p => (
                  <div key={p.productID} style={{ fontSize: '0.8rem', padding: '10px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                    <div style={{ fontWeight: '600', color: '#991b1b', fontSize: '0.85rem' }}>{p.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '2px' }}>Needs restock</div>
                  </div>
                ))}
                {outOfStockProducts.length > 4 && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '5px' }}>
                    +{outOfStockProducts.length - 4} more
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
    <div className="dashboard-container" style={{ padding: 0 }}>
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Product Management</span>
      </div>

      <h2 className="dashboard-title">Product Management</h2>

      <div className="filters-row" style={{ marginTop: '30px' }}>
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
      <div style={{ marginTop: '20px' }}>
        {currentProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No products found.</p>
        ) : (
          currentProducts.map((p) => {
            const stock = getStockStatus(p);
            return (
            <div 
              key={p.productID} 
              className="dashboard-list-item"
              onClick={() => openProductDetail(p.productID)}
              style={{ 
                cursor: 'pointer', 
                display: 'grid',
                gridTemplateColumns: '50px 2.5fr 120px 100px 100px',
                gap: '20px',
                alignItems: 'center',
                padding: '15px 18px'
              }}
            >
              {/* Image */}
              <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                {p.imageURL ? (
                  <img
                    src={p.imageURL.startsWith('/') ? p.imageURL : `/${p.imageURL}`}
                    alt={p.productName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    display: p.imageURL ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: '#9ca3af',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  N/A
                </div>
              </div>

              {/* Product Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem', color: '#111827', marginBottom: '5px' }}>
                  {p.productName}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '3px' }}>
                  {p.categoryName || "Uncategorized"}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {truncateDescription(p.description, 50)}
                </div>
              </div>

              {/* Price */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '500', color: '#6b7280', marginBottom: '3px' }}>
                  Price
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#059669' }}>
                  ${p.listPrice?.toFixed(2) || "0.00"}
                </div>
                {p.discountPercent > 0 && (
                  <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: '600', marginTop: '2px' }}>
                    -{p.discountPercent}%
                  </div>
                )}
              </div>

              {/* Stock */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '500', color: '#6b7280', marginBottom: '3px' }}>
                  Stock
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: stock.color }}>
                  {p.quantityOnHand || 0}
                </div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    backgroundColor: stock.bgColor,
                    color: stock.color,
                    border: `1px solid ${stock.borderColor}`,
                    marginTop: '3px'
                  }}
                >
                  {stock.label}
                </span>
              </div>

              {/* Status */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: '500', color: '#6b7280', marginBottom: '3px' }}>
                  Status
                </div>
                <span className={p.isActive ? "status-active" : "status-inactive"} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
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
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`pagination-page ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => goToPage(index + 1)}
              >
                {index + 1}
              </button>
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
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Product Metrics
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Total Products */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Total Products
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>
                {totalProducts}
              </div>
            </div>

            {/* Active Products */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Active
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {activeProducts}
              </div>
            </div>

            {/* Average Price */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Average Price
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                ${avgPrice}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Low Stock
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: lowStockCount > 0 ? '#dc2626' : '#059669' }}>
                {lowStockCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                (&lt; 5 units)
              </div>
            </div>

            {/* Out of Stock */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Out of Stock
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: outOfStockProducts.length > 0 ? '#dc2626' : '#059669' }}>
                {outOfStockProducts.length}
              </div>
            </div>

            {/* Inventory Health */}
            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                Inventory Health
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: outOfStockProducts.length === 0 && lowStockCount === 0 ? '#059669' : lowStockCount > 0 && outOfStockProducts.length === 0 ? '#d97706' : '#dc2626' }}>
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
