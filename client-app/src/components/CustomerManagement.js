import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import CustomerDetailModal from "./CustomerDetailModal";
import "../Styles/Dashboard.css";

export default function CustomerManagement() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      const data = await fetchData("customer");
      console.log("Customers loaded:", data);
      
      // Normalize the data to handle both PascalCase and camelCase
      const normalizedCustomers = (data || []).map(c => ({
        customerID: c.CustomerID || c.customerID,
        firstName: c.FirstName || c.firstName,
        lastName: c.LastName || c.lastName,
        emailAddress: c.EmailAddress || c.emailAddress,
        isActive: c.IsActive !== undefined ? c.IsActive : c.isActive
      }));
      
      setCustomers(normalizedCustomers);
      setFilteredCustomers(normalizedCustomers);
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

  function openCustomerDetail(customer) {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setSelectedCustomer(null);
    loadCustomers(); // Reload in case any changes were made
  }

  async function toggleCustomerStatus(id, activate) {
    const endpoint = activate
      ? `http://localhost:5077/api/customer/activate/${id}`
      : `http://localhost:5077/api/customer/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    closeDetailModal();
  }

  async function deleteCustomer(id) {
    if (!window.confirm("This will permanently delete this customer. Continue?"))
      return;

    await fetch(`http://localhost:5077/api/customer/delete/${id}`, { method: "DELETE" });
    closeDetailModal();
  }

  function handleEdit() {
    // TODO: Implement edit functionality
    alert("Edit functionality coming soon!");
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

      <div className="filters-row" style={{ marginTop: '30px' }}>
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
            <div 
              key={c.customerID} 
              className="dashboard-list-item"
              onClick={() => openCustomerDetail(c)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <strong>{c.firstName} {c.lastName}</strong>
                <p>{c.emailAddress}</p>
                <span className={c.isActive ? "text-green-700" : "text-red-600"}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
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

      {showDetailModal && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={closeDetailModal}
          onEdit={handleEdit}
          onToggleStatus={toggleCustomerStatus}
          onDelete={deleteCustomer}
        />
      )}
    </div>
  );
}
