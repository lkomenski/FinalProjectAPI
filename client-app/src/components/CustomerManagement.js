import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import "../Styles/Dashboard.css";

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSort, setCustomerSort] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const data = await fetchData("dashboard/admin");
      setCustomers(data.customers || []);
      setFilteredCustomers(data.customers || []);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  // Customer filtering
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [customers, customerSearch, customerSort, customerFilter]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  async function toggleCustomerStatus(id, activate) {
    const endpoint = activate
      ? `http://localhost:5077/api/customer/activate/${id}`
      : `http://localhost:5077/api/customer/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    loadCustomers();
  }

  async function deleteCustomer(id) {
    if (!window.confirm("This will permanently delete this customer. Continue?"))
      return;

    await fetch(`http://localhost:5077/api/customer/delete/${id}`, { method: "DELETE" });
    loadCustomers();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Customer Management</span>
      </div>

      <h2 className="dashboard-title">Customer Management</h2>

      <div className="filters-row">
        <input 
          className="dashboard-input" 
          placeholder="Search customers..." 
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)} 
        />
        <select className="dashboard-select" value={customerSort} onChange={(e) => setCustomerSort(e.target.value)}>
          <option value="">Sort By</option>
          <option value="firstName">First Name</option>
          <option value="lastName">Last Name</option>
          <option value="emailAddress">Email</option>
          <option value="isActive">Status</option>
        </select>
        <select className="dashboard-select" value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)}>
          <option value="">Show All</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button className="dashboard-btn dashboard-btn-success">
          + Add Customer
        </button>
      </div>

      {/* Customer List */}
      <div style={{ marginTop: '20px' }}>
        {currentCustomers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No customers found.</p>
        ) : (
          currentCustomers.map((c) => (
            <div key={c.customerID} className="dashboard-list-item">
              <div>
                <strong>{c.firstName} {c.lastName}</strong>
                <p>{c.emailAddress}</p>
                <span className={c.isActive ? "text-green-700" : "text-red-600"}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="dashboard-btn">
                  Edit
                </button>
                {c.isActive ? (
                  <button className="dashboard-btn dashboard-btn-warning" onClick={() => toggleCustomerStatus(c.customerID, false)}>
                    Deactivate
                  </button>
                ) : (
                  <button className="dashboard-btn dashboard-btn-success" onClick={() => toggleCustomerStatus(c.customerID, true)}>
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
      </div>
    </div>
  );
}
