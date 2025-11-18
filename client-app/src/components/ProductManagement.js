import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import ProductForm from "./ProductForm";
import "../Styles/Dashboard.css";

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await fetchData("dashboard/admin");
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
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

  function handleFormClose() {
    setSelectedProduct(null);
    setIsAddingProduct(false);
    loadProducts();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
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
          currentProducts.map((p) => (
            <div key={p.productID} className="dashboard-list-item">
              <div>
                <strong>{p.productName}</strong>
                <p>Code: {p.productCode} | Price: ${p.listPrice?.toFixed(2) || "0.00"}</p>
                <p>Discount: {p.discountPercent?.toFixed(0) || 0}%</p>
                <span className={p.isActive ? "text-green-700" : "text-red-600"}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="dashboard-btn" onClick={() => { setSelectedProduct(p); setIsAddingProduct(false); }}>
                  Edit
                </button>

                {p.isActive ? (
                  <button className="dashboard-btn dashboard-btn-warning" onClick={() => deactivateProduct(p.productID)}>
                    Deactivate
                  </button>
                ) : (
                  <button className="dashboard-btn dashboard-btn-success" onClick={() => activateProduct(p.productID)}>
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))
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

      {(isAddingProduct || selectedProduct) && (
        <ProductForm
          product={selectedProduct}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
