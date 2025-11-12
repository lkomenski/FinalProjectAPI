import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import VendorForm from "./VendorForm";
import ProductForm from "./ProductForm";
import "../Styles/Dashboard.css";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);

  // ---------- PRODUCT STATE ----------
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // ---------- VENDOR STATE ----------
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [filter, setFilter] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // --------------------------------------
  // LOAD DASHBOARD + VENDORS + PRODUCTS
  // --------------------------------------
  useEffect(() => {
    loadDashboard();
    loadVendors();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboard() {
    try {
      if (!user || user.role !== "admin") {
        setError("Unauthorized access. Admins only.");
        setLoading(false);
        return;
      }

      const data = await fetchData("dashboard/employee");
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadVendors() {
    try {
      const res = await fetch("https://localhost:5077/api/vendor/all");
      const data = await res.json();
      setVendors(data);
      setFilteredVendors(data);
    } catch (err) {
      setError("Failed to load vendors.");
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch("https://localhost:5077/api/product/all");
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError("Failed to load products.");
    }
  }

  // -------------------------------
  // VENDOR FILTERING
  // -------------------------------
  useEffect(() => {
    let result = [...vendors];

    // Active / inactive filter
    if (filter === "active") {
      result = result.filter((v) => v.IsActive);
    } else if (filter === "inactive") {
      result = result.filter((v) => !v.IsActive);
    }

    // Search
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.VendorName.toLowerCase().includes(s) ||
          v.VendorCity.toLowerCase().includes(s) ||
          v.VendorContactFName.toLowerCase().includes(s) ||
          v.VendorContactLName.toLowerCase().includes(s)
      );
    }

    // Sort
    if (sortField) {
      result.sort((a, b) => (a[sortField] > b[sortField] ? 1 : -1));
    }

    setFilteredVendors(result);
  }, [vendors, search, filter, sortField]);

  // -------------------------------
  // PRODUCT FILTERING
  // -------------------------------
  useEffect(() => {
    let result = [...products];

    // Filter
    if (productFilter === "active") {
      result = result.filter((p) => p.IsActive);
    } else if (productFilter === "inactive") {
      result = result.filter((p) => !p.IsActive);
    }

    // Search
    if (productSearch.trim() !== "") {
      const s = productSearch.toLowerCase();
      result = result.filter((p) =>
        p.ProductName.toLowerCase().includes(s)
      );
    }

    // Sort
    if (productSort) {
      result.sort((a, b) => (a[productSort] > b[productSort] ? 1 : -1));
    }

    setFilteredProducts(result);
  }, [productSearch, productSort, productFilter, products]);

  // -------------------------------
  // Vendor Activate/Deactivate
  // -------------------------------
  async function toggleVendorStatus(id, activate) {
    const endpoint = activate
      ? `https://localhost:5077/api/vendor/activate/${id}`
      : `https://localhost:5077/api/vendor/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    loadVendors();
  }

  // -------------------------------
  // Product Activate/Deactivate
  // -------------------------------
  async function activateProduct(id) {
    await fetch(
      `https://localhost:5077/api/product/activate/${id}`,
      { method: "PUT" }
    );
    loadProducts();
  }

  async function deactivateProduct(id) {
    await fetch(
      `https://localhost:5077/api/product/deactivate/${id}`,
      { method: "PUT" }
    );
    loadProducts();
  }

  // -------------------------------
  // RENDER UI
  // -------------------------------
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      {/* TITLE */}
      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* ------- STATS SECTION ------- */}
      <h3 className="dashboard-subtitle">System Metrics</h3>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Total Customers</h3>
          <div className="value">{stats?.TotalCustomers ?? 0}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Vendors</h3>
          <div className="value">{stats?.TotalVendors ?? 0}</div>
        </div>

        <div className="dashboard-card">
          <h3>Active Vendors</h3>
          <div className="value">{stats?.ActiveVendors ?? 0}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Products</h3>
          <div className="value">{stats?.TotalProducts ?? 0}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <div className="value">
            ${stats?.TotalSales?.toFixed(2) ?? "0.00"}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Outstanding Invoices</h3>
          <div className="value">
            ${stats?.TotalOutstandingInvoices?.toFixed(2) ?? "0.00"}
          </div>
        </div>
      </div>

      {/* ------- VENDOR MANAGEMENT ------- */}
      <h3 className="dashboard-subtitle">Vendor Management</h3>

      {/* Search + Filter + Sort Controls */}
      <div className="filters-row">
        <input
          placeholder="Search vendors..."
          className="dashboard-input"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          onChange={(e) => setSortField(e.target.value)}
          className="dashboard-select"
        >
          <option value="">Sort By</option>
          <option value="VendorName">Name</option>
          <option value="VendorCity">City</option>
          <option value="VendorState">State</option>
          <option value="IsActive">Status</option>
        </select>

        <select
          onChange={(e) => setFilter(e.target.value)}
          className="dashboard-select"
        >
          <option value="">Show All</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button
          className="dashboard-btn dashboard-btn-success"
          onClick={() => {
            setSelectedVendor(null);
            setIsAddingVendor(true);
          }}
        >
          + Add Vendor
        </button>
      </div>

      {/* Vendor List */}
      {filteredVendors.map((v) => (
        <div
          key={v.VendorID}
          className="dashboard-list-item"
        >
          <div>
            <strong>{v.VendorName}</strong><br />
            {v.VendorCity}, {v.VendorState}<br />
            Contact: {v.VendorContactFName} {v.VendorContactLName}<br />
            <span
              className={
                v.IsActive ? "text-green-700" : "text-red-600"
              }
            >
              {v.IsActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              className="dashboard-btn"
              onClick={() => {
                setSelectedVendor(v);
                setIsAddingVendor(false);
              }}
            >
              Edit
            </button>

            {v.IsActive ? (
              <button
                className="dashboard-btn dashboard-btn-danger"
                onClick={() => toggleVendorStatus(v.VendorID, false)}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="dashboard-btn dashboard-btn-success"
                onClick={() => toggleVendorStatus(v.VendorID, true)}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Vendor Form Modal */}
      {(selectedVendor || isAddingVendor) && (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setSelectedVendor(null);
            setIsAddingVendor(false);
            loadVendors();
          }}
        />
      )}

      {/* ------- PRODUCT MANAGEMENT ------- */}
      <h3 className="dashboard-subtitle">Product Management</h3>

      {/* SEARCH + SORT + FILTER */}
      <div className="filters-row">
        <input
          placeholder="Search products..."
          className="dashboard-input"
          onChange={(e) => setProductSearch(e.target.value)}
        />

        <select
          onChange={(e) => setProductSort(e.target.value)}
          className="dashboard-select"
        >
          <option value="">Sort By</option>
          <option value="ProductName">Name</option>
          <option value="ListPrice">Price</option>
          <option value="DiscountPercent">Discount</option>
          <option value="IsActive">Status</option>
        </select>

        <select
          onChange={(e) => setProductFilter(e.target.value)}
          className="dashboard-select"
        >
          <option value="">Show All</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>

        <button
          className="dashboard-btn dashboard-btn-success"
          onClick={() => {
            setSelectedProduct(null);
            setIsAddingProduct(true);
          }}
        >
          + Add Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      {filteredProducts.map((p) => (
        <div
          key={p.ProductID}
          className="dashboard-list-item"
        >
          <div>
            <strong>{p.ProductName}</strong><br />
            Price: ${p.ListPrice?.toFixed(2)}<br />
            Discount: {p.DiscountPercent}%<br />
            <span
              className={
                p.IsActive ? "text-green-700" : "text-red-600"
              }
            >
              {p.IsActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              className="dashboard-btn"
              onClick={() => {
                setSelectedProduct(p);
                setIsAddingProduct(false);
              }}
            >
              Edit
            </button>

            {p.IsActive ? (
              <button
                className="dashboard-btn dashboard-btn-danger"
                onClick={() => deactivateProduct(p.ProductID)}
              >
                Deactivate
              </button>
            ) : (
              <button
                className="dashboard-btn dashboard-btn-success"
                onClick={() => activateProduct(p.ProductID)}
              >
                Activate
              </button>
            )}
          </div>
        </div>
      ))}

      {/* PRODUCT FORM MODAL */}
      {(selectedProduct || isAddingProduct) && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setIsAddingProduct(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
}
