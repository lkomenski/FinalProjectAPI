import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import VendorForm from "./VendorForm";
import ProductForm from "./ProductForm";
import "../Styles/Dashboard.css";

export default function EmployeeDashboard() {
  // ---------- SYSTEM STATS ----------
  const [stats, setStats] = useState(null);

  // ---------- CUSTOMERS ----------
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSort, setCustomerSort] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  // ---------- PRODUCTS ----------
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("");
  const [productFilter, setProductFilter] = useState("");

  // ---------- VENDORS ----------
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSort, setVendorSort] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  // ---------- UI ----------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // -------------------------------------------------------------------
  // LOAD DASHBOARD
  // -------------------------------------------------------------------
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      if (!user || user.role !== "admin") {
        setError("Unauthorized access. Admins only.");
        setLoading(false);
        return;
      }

      const data = await fetchData("dashboard/admin");

      setStats({
        totalCustomers: data.totalCustomers,
        activeCustomers: data.activeCustomers,
        totalVendors: data.totalVendors,
        activeVendors: data.activeVendors,
        totalProducts: data.totalProducts,
        totalSales: data.totalSales,
        totalOutstandingInvoices: data.totalOutstandingInvoices,
      });

      // Load customers
      setCustomers(data.customers || []);
      setFilteredCustomers(data.customers || []);

      // Load vendors
      setVendors(data.vendors);
      setFilteredVendors(data.vendors);

      // Load products
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err) {
      setError(err.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------------------
  // CUSTOMER FILTERING
  // -------------------------------------------------------------------
  useEffect(() => {
    let list = [...customers];

    if (customerFilter === "active") list = list.filter(c => c.isActive);
    if (customerFilter === "inactive") list = list.filter(c => !c.isActive);

    if (customerSearch.trim() !== "") {
      const s = customerSearch.toLowerCase();
      list = list.filter(c =>
        c.firstName.toLowerCase().includes(s) ||
        c.lastName.toLowerCase().includes(s) ||
        c.emailAddress.toLowerCase().includes(s)
      );
    }

    if (customerSort) {
      list.sort((a, b) => (a[customerSort] > b[customerSort] ? 1 : -1));
    }

    setFilteredCustomers(list);
  }, [customers, customerSearch, customerSort, customerFilter]);

  // -------------------------------------------------------------------
  // CUSTOMER ACTIONS
  // -------------------------------------------------------------------
  async function deactivateCustomer(id) {
    await fetch(`http://localhost:5077/api/customers/deactivate/${id}`, { method: "PUT" });
    loadDashboard();
  }

  async function deleteCustomer(id) {
    if (!window.confirm("This will permanently delete this customer. Continue?"))
      return;

    await fetch(`http://localhost:5077/api/customers/delete/${id}`, { method: "DELETE" });
    loadDashboard();
  }

  // -------------------------------------------------------------------
  // VENDOR FILTERING
  // -------------------------------------------------------------------
  useEffect(() => {
    let list = [...vendors];

    if (vendorFilter === "active") list = list.filter(v => v.isActive);
    if (vendorFilter === "inactive") list = list.filter(v => !v.isActive);

    if (vendorSearch.trim() !== "") {
      const s = vendorSearch.toLowerCase();
      list = list.filter(v =>
        v.vendorName.toLowerCase().includes(s) ||
        v.vendorCity.toLowerCase().includes(s) ||
        v.vendorContactFName.toLowerCase().includes(s) ||
        v.vendorContactLName.toLowerCase().includes(s)
      );
    }

    if (vendorSort) list.sort((a, b) => (a[vendorSort] > b[vendorSort] ? 1 : -1));

    setFilteredVendors(list);
  }, [vendors, vendorSearch, vendorSort, vendorFilter]);

  // Toggle vendor active status
  async function toggleVendorStatus(id, activate) {
    const endpoint = activate
      ? `http://localhost:5077/api/vendors/activate/${id}`
      : `http://localhost:5077/api/vendors/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    loadDashboard();
  }

  // -------------------------------------------------------------------
  // PRODUCT FILTERING
  // -------------------------------------------------------------------
  useEffect(() => {
    let list = [...products];

    if (productFilter === "active") list = list.filter(p => p.isActive);
    if (productFilter === "inactive") list = list.filter(p => !p.isActive);

    if (productSearch.trim() !== "") {
      const s = productSearch.toLowerCase();
      list = list.filter(p => p.productName.toLowerCase().includes(s));
    }

    if (productSort)
      list.sort((a, b) => (a[productSort] > b[productSort] ? 1 : -1));

    setFilteredProducts(list);
  }, [products, productSearch, productSort, productFilter]);

  async function activateProduct(id) {
    await fetch(`http://localhost:5077/api/products/activate/${id}`, { method: "PUT" });
    loadDashboard();
  }

  async function deactivateProduct(id) {
    await fetch(`http://localhost:5077/api/products/deactivate/${id}`, { method: "PUT" });
    loadDashboard();
  }

  // -------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">

      <h2 className="dashboard-title">Admin Dashboard</h2>

      {/* ===================== SYSTEM METRICS ===================== */}
      <h3 className="dashboard-subtitle">System Metrics</h3>
      <div className="dashboard-grid">
        <div className="dashboard-card"><h3>Total Customers</h3><div className="value">{stats.totalCustomers}</div></div>
        <div className="dashboard-card"><h3>Active Customers</h3><div className="value">{stats.activeCustomers}</div></div>
        <div className="dashboard-card"><h3>Total Vendors</h3><div className="value">{stats.totalVendors}</div></div>
        <div className="dashboard-card"><h3>Active Vendors</h3><div className="value">{stats.activeVendors}</div></div>
        <div className="dashboard-card"><h3>Total Products</h3><div className="value">{stats.totalProducts}</div></div>
        <div className="dashboard-card"><h3>Total Sales</h3><div className="value">${stats.totalSales.toFixed(2)}</div></div>
        <div className="dashboard-card"><h3>Outstanding Invoices</h3><div className="value">${stats.totalOutstandingInvoices.toFixed(2)}</div></div>
      </div>

      {/* ===================== CUSTOMER MANAGEMENT ===================== */}
      <h3 className="dashboard-subtitle">Customer Management</h3>

      <div className="filters-row">
        <input className="dashboard-input" placeholder="Search customers..." onChange={(e) => setCustomerSearch(e.target.value)} />
        <select className="dashboard-select" onChange={(e) => setCustomerSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="emailAddress">Email</option>
          <option value="isActive">Status</option>
        </select>
        <select className="dashboard-select" onChange={(e) => setCustomerFilter(e.target.value)}>
          <option value="">Show All</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      <div className="scroll-panel">
        {filteredCustomers.map((c) => (
          <div key={c.customerID} className="dashboard-list-item">
            <div>
              <strong>{c.firstName} {c.lastName}</strong>
              <p>{c.emailAddress}</p>
              <span className={c.isActive ? "text-green-700" : "text-red-600"}>
                {c.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex gap-2">
              {c.isActive ? (
                <button className="dashboard-btn dashboard-btn-warning" onClick={() => deactivateCustomer(c.customerID)}>
                  Deactivate
                </button>
              ) : (
                <button className="dashboard-btn dashboard-btn-success" onClick={() => deactivateCustomer(c.customerID)}>
                  Activate
                </button>
              )}

              <button
                className="dashboard-btn dashboard-btn-danger"
                onClick={() => deleteCustomer(c.customerID)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== VENDOR MANAGEMENT ===================== */}
      <h3 className="dashboard-subtitle">Vendor Management</h3>

      <div className="filters-row">
        <input className="dashboard-input" placeholder="Search vendors..." onChange={(e) => setVendorSearch(e.target.value)} />

        <select className="dashboard-select" onChange={(e) => setVendorSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="vendorName">Name</option>
          <option value="vendorCity">City</option>
          <option value="vendorState">State</option>
          <option value="isActive">Status</option>
        </select>

        <select className="dashboard-select" onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="">Show All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          className="dashboard-btn dashboard-btn-success"
          onClick={() => { setSelectedVendor(null); setIsAddingVendor(true); }}
        >
          + Add Vendor
        </button>
      </div>

      <div className="scroll-panel">
        {filteredVendors.map((v) => (
          <div key={v.vendorID} className="dashboard-list-item">
            <div>
              <strong>{v.vendorName}</strong>
              <p>{v.vendorCity}, {v.vendorState}</p>
              <p>Contact: {v.vendorContactFName} {v.vendorContactLName}</p>
              <span className={v.isActive ? "text-green-700" : "text-red-600"}>
                {v.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex gap-2">
              <button className="dashboard-btn" onClick={() => { setSelectedVendor(v); setIsAddingVendor(false); }}>
                Edit
              </button>

              {v.isActive ? (
                <button className="dashboard-btn dashboard-btn-danger" onClick={() => toggleVendorStatus(v.vendorID, false)}>
                  Deactivate
                </button>
              ) : (
                <button className="dashboard-btn dashboard-btn-success" onClick={() => toggleVendorStatus(v.vendorID, true)}>
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(selectedVendor || isAddingVendor) && (
        <VendorForm
          vendor={selectedVendor}
          onClose={() => {
            setSelectedVendor(null);
            setIsAddingVendor(false);
            loadDashboard();
          }}
        />
      )}

      {/* ===================== PRODUCT MANAGEMENT ===================== */}
      <h3 className="dashboard-subtitle">Product Management</h3>

      <div className="filters-row">
        <input className="dashboard-input" placeholder="Search products..." onChange={(e) => setProductSearch(e.target.value)} />

        <select className="dashboard-select" onChange={(e) => setProductSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="productName">Name</option>
          <option value="listPrice">Price</option>
          <option value="discountPercent">Discount</option>
          <option value="isActive">Status</option>
        </select>

        <select className="dashboard-select" onChange={(e) => setProductFilter(e.target.value)}>
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

      <div className="scroll-panel">
        {filteredProducts.map((p) => (
          <div key={p.productID} className="dashboard-list-item">
            <div>
              <strong>{p.productName}</strong><br />
              Price: ${ (p.listPrice ?? 0).toFixed(2) } &nbsp;|&nbsp;
              Discount: { p.discountPercent ?? 0 }%
              <br />
              <span className={p.isActive ? "text-green-700" : "text-red-600"}>
                {p.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex gap-2">
              <button className="dashboard-btn" onClick={() => { setSelectedProduct(p); setIsAddingProduct(false); }}>
                Edit
              </button>

              {p.isActive ? (
                <button className="dashboard-btn dashboard-btn-danger" onClick={() => deactivateProduct(p.productID)}>
                  Deactivate
                </button>
              ) : (
                <button className="dashboard-btn dashboard-btn-success" onClick={() => activateProduct(p.productID)}>
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {(selectedProduct || isAddingProduct) && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setIsAddingProduct(false);
            loadDashboard();
          }}
        />
      )}
    </div>
  );
}
