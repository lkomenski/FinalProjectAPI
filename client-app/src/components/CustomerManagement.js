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

  // Calculate customer statistics
  const activeCustomers = customers.filter(c => c.isActive);
  const inactiveCustomers = customers.filter(c => !c.isActive);
  const recentCustomers = [...customers].slice(0, 5);

  return (
    <>
    <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Customer Information */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          {/* Quick Tip */}
          <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af' }}>
              Quick Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', lineHeight: '1.4' }}>
              Click on any customer to view their complete profile, order history, and manage their account status.
            </p>
          </div>

          {/* Statistics */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
              Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '4px', fontWeight: '500' }}>Active Customers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>{activeCustomers.length}</div>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>Total Customers</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{customers.length}</div>
              </div>
              {inactiveCustomers.length > 0 && (
                <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '4px', fontWeight: '500' }}>Inactive</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>{inactiveCustomers.length}</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          {recentCustomers.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                Recent Customers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentCustomers.map((customer) => (
                  <div 
                    key={customer.customerID}
                    onClick={() => openCustomerDetail(customer)}
                    style={{
                      fontSize: '0.8rem',
                      padding: '10px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px', fontSize: '0.85rem' }}>
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px' }}>
                      {customer.emailAddress}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: customer.isActive ? '#059669' : '#6b7280',
                      fontWeight: '500'
                    }}>
                      {customer.isActive ? '● Active' : '○ Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-container" style={{ padding: 0 }}>
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
        </div>
      </div>

      {/* Right Panel - Metrics */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Customer Metrics
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Total Customers */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Total Customers
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827' }}>
                {customers.length}
              </div>
            </div>

            {/* Active Customers */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                Active
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {activeCustomers.length}
              </div>
            </div>

            {/* Inactive Customers */}
            {inactiveCustomers.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '500', color: '#6b7280', marginBottom: '5px' }}>
                  Inactive
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                  {inactiveCustomers.length}
                </div>
              </div>
            )}

            {/* Account Status */}
            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                Account Health
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: inactiveCustomers.length === 0 ? '#059669' : inactiveCustomers.length <= customers.length * 0.1 ? '#d97706' : '#dc2626' }}>
                {inactiveCustomers.length === 0 ? 'Excellent' : 
                 inactiveCustomers.length <= customers.length * 0.1 ? 'Good' : 'Needs Review'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                {((activeCustomers.length / customers.length) * 100).toFixed(1)}% active
              </div>
            </div>
          </div>
        </div>
      </div>
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
    </>
  );
}
