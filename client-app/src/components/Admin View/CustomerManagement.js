import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import CustomerDetailModal from "./CustomerDetailModal";
import "../../Styles/Dashboard.css";
import "../../Styles/ManagementPage.css";

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
      
      // Normalize the data to handle both PascalCase and camelCase
      const normalizedCustomers = (data || []).map(c => ({
        customerID: c.CustomerID || c.customerID,
        firstName: c.FirstName || c.firstName,
        lastName: c.LastName || c.lastName,
        emailAddress: c.EmailAddress || c.emailAddress,
        isActive: c.IsActive !== undefined ? c.IsActive : (c.isActive !== undefined ? c.isActive : true)
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

  function openCustomerDetail(customer) {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setSelectedCustomer(null);
    // Don't reload - we're managing state updates directly
    // loadCustomers(); 
  }

  async function toggleCustomerStatus(id, activate) {
    try {
      const endpoint = activate
        ? `http://localhost:5077/api/customer/activate/${id}`
        : `http://localhost:5077/api/customer/deactivate/${id}`;
      
      const response = await fetch(endpoint, { method: "PUT" });
      
      if (response.ok) {
        // Update customers state - this will trigger the useEffect to update filteredCustomers
        setCustomers(prevCustomers => {
          const updated = prevCustomers.map(c => 
            c.customerID === id ? { ...c, isActive: activate } : c
          );
          
          // Also update the selectedCustomer for the modal
          const updatedSelected = updated.find(c => c.customerID === id);
          if (updatedSelected) {
            setSelectedCustomer(updatedSelected);
          }
          
          return updated;
        });
        
        alert(`Customer ${activate ? 'activated' : 'deactivated'} successfully!`);
      } else {
        const errorText = await response.text();
        alert(`Error updating customer status: ${errorText}`);
      }
    } catch (error) {
      alert('Failed to update customer status. Please try again.');
    }
  }

  async function deleteCustomer(id) {
    if (!window.confirm("This will permanently delete this customer. Continue?"))
      return;

    try {
      const response = await fetch(`http://localhost:5077/api/customer/delete/${id}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        const responseData = await response.json().catch(() => null);
        
        // Show success message with any returned info
        if (responseData && responseData.message) {
          alert(responseData.message);
        } else {
          alert("Customer deleted successfully!");
        }
        
        // Update local state to remove the deleted customer
        setCustomers(prev => prev.filter(c => c.customerID !== id));
        closeDetailModal();
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        alert(`Error deleting customer: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      alert('Failed to delete customer. Please try again.');
    }
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
  // Sort by customerID descending (most recent first) and take first 5
  const recentCustomers = [...customers]
    .sort((a, b) => b.customerID - a.customerID)
    .slice(0, 5);

  return (
    <>
    <div className="customer-management-container">
      {/* Left Panel - Customer Information */}
      <div className="customer-management-left-panel">
        <div className="dashboard-card customer-management-left-card">
          {/* Quick Tip */}
          <div className="customer-management-quick-tip">
            <h4 className="customer-management-quick-tip-title">
              Quick Tip
            </h4>
            <p className="customer-management-quick-tip-text">
              Click on any customer to view their complete profile, order history, and manage their account status.
            </p>
          </div>

          {/* Statistics */}
          <div className="customer-management-stats-section">
            <h3 className="customer-management-section-title">
              Overview
            </h3>
            <div className="customer-management-stats-grid">
              <div className="customer-management-stat-card-active">
                <div className="customer-management-stat-label-active">Active Customers</div>
                <div className="customer-management-stat-value-active">{activeCustomers.length}</div>
              </div>
              <div className="customer-management-stat-card-total">
                <div className="customer-management-stat-label-total">Total Customers</div>
                <div className="customer-management-stat-value-total">{customers.length}</div>
              </div>
              {inactiveCustomers.length > 0 && (
                <div className="customer-management-stat-card-inactive">
                  <div className="customer-management-stat-label-inactive">Inactive</div>
                  <div className="customer-management-stat-value-inactive">{inactiveCustomers.length}</div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Customers */}
          {recentCustomers.length > 0 && (
            <div>
              <h3 className="customer-management-section-title">
                Recent Customers
              </h3>
              <div className="customer-management-recent-grid">
                {recentCustomers.map((customer) => (
                  <div 
                    key={customer.customerID}
                    onClick={() => openCustomerDetail(customer)}
                    className="customer-management-recent-customer"
                  >
                    <div className="customer-management-recent-customer-name">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="customer-management-recent-customer-email">
                      {customer.emailAddress}
                    </div>
                    <div className={`customer-management-recent-customer-status ${
                      customer.isActive ? 'active' : 'inactive'
                    }`}>
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
      <div className="customer-management-main-content">
        <div className="dashboard-container customer-management-main-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
            <span className="breadcrumb-separator"> / </span>
            <span className="breadcrumb-current">Customer Management</span>
          </div>

          <h2 className="dashboard-title">Customer Management</h2>

          <div className="filters-row customer-management-filters-section">
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
      </div>

      {/* Customer List */}
      <div className="customer-management-list-section">
        {currentCustomers.length === 0 ? (
          <p className="customer-management-no-customers">No customers found.</p>
        ) : (
          currentCustomers.map((c) => (
            <div 
              key={c.customerID} 
              className="dashboard-list-item customer-list-item"
              onClick={() => openCustomerDetail(c)}
            >
              {/* Customer Name */}
              <div className="customer-info">
                <div className="customer-info-name">
                  {c.firstName} {c.lastName}
                </div>
                <div className="customer-info-email">
                  {c.emailAddress}
                </div>
              </div>

              {/* Customer ID */}
              <div className="customer-id-section">
                <div className="customer-id-label">ID</div>
                <div className="customer-id-value">#{c.customerID}</div>
              </div>

              {/* Status */}
              <div className="customer-status-section">
                <div className="customer-status-label">Status</div>
                <span className={`status-badge ${c.isActive ? 'status-active' : 'status-inactive'}`}>
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
      </div>
        </div>
      </div>

      {/* Right Panel - Metrics */}
      <div className="customer-management-right-panel">
        <div className="dashboard-card customer-management-right-card">
          <h3 className="customer-management-metrics-title">
            Customer Metrics
          </h3>
          
          <div className="customer-management-metrics-grid">
            {/* Total Customers */}
            <div>
              <div className="customer-management-metric-label">
                Total Customers
              </div>
              <div className="customer-management-metric-value-large">
                {customers.length}
              </div>
            </div>

            {/* Active Customers */}
            <div>
              <div className="customer-management-metric-label">
                Active
              </div>
              <div className="customer-management-metric-value-medium active">
                {activeCustomers.length}
              </div>
            </div>

            {/* Inactive Customers */}
            {inactiveCustomers.length > 0 && (
              <div>
                <div className="customer-management-metric-label">
                  Inactive
                </div>
                <div className="customer-management-metric-value-medium inactive">
                  {inactiveCustomers.length}
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="customer-management-health-card">
              <div className="customer-management-health-label">
                Account Health
              </div>
              <div className={`customer-management-health-value ${
                inactiveCustomers.length === 0 ? 'excellent' : 
                inactiveCustomers.length <= customers.length * 0.1 ? 'good' : 'needs-review'
              }`}>
                {inactiveCustomers.length === 0 ? 'Excellent' : 
                 inactiveCustomers.length <= customers.length * 0.1 ? 'Good' : 'Needs Review'}
              </div>
              <div className="customer-management-health-percentage">
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
