import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import VendorForm from "../Vendor View/VendorForm";
import VendorDetailModal from "../Vendor View/VendorDetailModal";
import TokenModal from "../Vendor View/TokenModal";
import "../../Styles/Dashboard.css";
import "../../Styles/ManagementPage.css";

export default function VendorManagement() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailVendorId, setDetailVendorId] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorSort, setVendorSort] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadVendors();
    loadInvoices();
  }, []);

  async function loadVendors() {
    try {
      const data = await fetchData("vendors");
      setVendors(data || []);
      setFilteredVendors(data || []);
    } catch (err) {
      setError(err.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  async function loadInvoices() {
    try {
      const data = await fetchData("invoices");
      setInvoices(data || []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    }
  }

  // Vendor filtering
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [vendors, vendorSearch, vendorSort, vendorFilter]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  async function toggleVendorStatus(id, activate) {
    const endpoint = activate
      ? `http://localhost:5077/api/vendors/activate/${id}`
      : `http://localhost:5077/api/vendors/deactivate/${id}`;

    await fetch(endpoint, { method: "PUT" });
    loadVendors();
  }

  async function generateToken(vendorId) {
    try {
      const response = await fetch(`http://localhost:5077/api/vendors/generate-token/${vendorId}`, { method: "POST" });
      const data = await response.json();
      
      if (response.ok) {
        // Show token in modal instead of alert
        setTokenData({
          registrationToken: data.registrationToken,
          tokenExpiry: data.tokenExpiry,
          hoursUntilExpiry: data.hoursUntilExpiry,
          vendorID: data.vendorID,
          vendorName: data.vendorName,
          firstName: data.firstName,
          lastName: data.lastName,
          vendorEmail: data.vendorEmail
        });
        setShowTokenModal(true);
        setShowDetailModal(false); // Close detail modal when showing token
      } else {
        alert(`Failed to generate token: ${data}`);
      }
    } catch (err) {
      alert("Failed to generate token");
    }
  }

  function handleFormClose() {
    setSelectedVendor(null);
    setIsAddingVendor(false);
    loadVendors();
  }

  function openVendorDetail(vendorId) {
    setDetailVendorId(vendorId);
    setShowDetailModal(true);
  }

  function closeDetailModal() {
    setShowDetailModal(false);
    setDetailVendorId(null);
    loadVendors(); // Reload in case any changes were made
  }

  function closeTokenModal() {
    setShowTokenModal(false);
    setTokenData(null);
    loadVendors(); // Reload vendors after token generation
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Calculate vendor statistics
  const activeVendors = vendors.filter(v => v.isActive);
  const inactiveVendors = vendors.filter(v => !v.isActive);
  const recentVendors = [...vendors].sort((a, b) => 
    new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0)
  ).slice(0, 5);

  // Calculate invoice metrics
  const vendorInvoiceStats = vendors.map(vendor => {
    const vendorInvoices = invoices.filter(inv => inv.vendorID === vendor.vendorID);
    const totalAmount = vendorInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const outstandingAmount = vendorInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
    const unpaidInvoices = vendorInvoices.filter(inv => !inv.isPaid);
    
    return {
      vendorID: vendor.vendorID,
      vendorName: vendor.vendorName,
      totalInvoices: vendorInvoices.length,
      totalAmount,
      outstandingAmount,
      unpaidCount: unpaidInvoices.length
    };
  });

  const vendorsWithBalance = vendorInvoiceStats.filter(v => v.outstandingAmount > 0);
  const totalOutstanding = vendorInvoiceStats.reduce((sum, v) => sum + v.outstandingAmount, 0);
  const topVendorsByAmount = [...vendorInvoiceStats]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5)
    .filter(v => v.totalAmount > 0);
  
  const totalInvoiceAmount = vendorInvoiceStats.reduce((sum, v) => sum + v.totalAmount, 0);
  const vendorsWithInvoices = vendorInvoiceStats.filter(v => v.totalInvoices > 0).length;
  const avgInvoiceValue = vendorsWithInvoices > 0 ? totalInvoiceAmount / vendorsWithInvoices : 0;

  return (
    <>
    <div className="vendor-management-layout">
      {/* Left Panel - Quick Tips & Recently Added */}
      <div className="vendor-left-panel">
        <div className="dashboard-card vendor-left-card">
          {/* Quick Tip */}
          <div className="vendor-quick-tip">
            <h4 className="vendor-quick-tip-title">
              Quick Tip
            </h4>
            <p className="vendor-quick-tip-text">
              Generate tokens for vendors to allow them to view and manage their invoices through the vendor portal.
            </p>
          </div>

          {/* Recently Added Vendors */}
          {recentVendors.length > 0 && (
            <div>
              <h3 className="vendor-recently-added-title">
                Recently Added
              </h3>
              <div className="vendor-recent-list">
                {recentVendors.map((vendor) => (
                  <div 
                    key={vendor.vendorID}
                    onClick={() => { setDetailVendorId(vendor.vendorID); setShowDetailModal(true); }}
                    className="vendor-recent-item"
                  >
                    <div className="vendor-recent-name">
                      {vendor.vendorName}
                    </div>
                    <div className="vendor-recent-location">
                      {vendor.vendorCity}, {vendor.vendorState}
                    </div>
                    <div className={`vendor-recent-status ${vendor.isActive ? 'active' : 'inactive'}`}>
                      {vendor.isActive ? '● Active' : '○ Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="vendor-main-content">
        <div className="dashboard-container">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
            <span className="breadcrumb-separator"> / </span>
            <span className="breadcrumb-current">Vendor Management</span>
          </div>

          <h2 className="dashboard-title">Vendor Management</h2>

          <div className="filters-row">
            <input 
              className="dashboard-input" 
              placeholder="Search vendors..." 
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)} 
            />

            <select className="dashboard-select" value={vendorSort} onChange={(e) => setVendorSort(e.target.value)}>
              <option value="">Sort By</option>
              <option value="vendorName">Name</option>
              <option value="vendorCity">City</option>
              <option value="vendorState">State</option>
              <option value="isActive">Status</option>
            </select>

            <select className="dashboard-select" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
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

          {/* Vendor List */}
          <div className="vendor-list-section">
        {currentVendors.length === 0 ? (
          <p className="vendor-no-results">No vendors found.</p>
        ) : (
          currentVendors.map((v) => (
            <div 
              key={v.vendorID} 
              className="dashboard-list-item vendor-list-item"
              onClick={() => openVendorDetail(v.vendorID)}
            >
              <div>
                <strong>{v.vendorName}</strong>
                <p>{v.vendorCity}, {v.vendorState}</p>
                <p>Contact: {v.vendorContactFName} {v.vendorContactLName}</p>
                <span className={v.isActive ? "text-green-700" : "text-red-600"}>
                  {v.isActive ? "Active" : "Inactive"}
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} vendors
      </div>
        </div>
      </div>

      {/* Right Panel - Business Metrics */}
      <div className="vendor-right-panel">
        <div className="dashboard-card vendor-metrics-card">
          <h3 className="vendor-metrics-title">
            Vendor Metrics
          </h3>
          
          <div className="vendor-metrics-container">
            {/* Active vs Total Vendors */}
            <div className="vendor-metric-active">
              <div className="vendor-metric-active-label">
                Active Vendors
              </div>
              <div className="vendor-metric-active-numbers">
                <div className="vendor-metric-active-count">
                  {activeVendors.length}
                </div>
                <div className="vendor-metric-active-total">
                  / {vendors.length} total
                </div>
              </div>
              <div className="vendor-metric-active-percentage">
                {vendors.length > 0 ? ((activeVendors.length / vendors.length) * 100).toFixed(0) : 0}% of network
              </div>
            </div>

            {/* Outstanding Balances */}
            {vendorsWithBalance.length > 0 && (
              <div className="vendor-metric-outstanding">
                <div className="vendor-metric-outstanding-label">
                  Outstanding Balances
                </div>
                <div className="vendor-metric-outstanding-amount">
                  ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="vendor-metric-outstanding-details">
                  {vendorsWithBalance.length} vendor{vendorsWithBalance.length !== 1 ? 's' : ''} with unpaid invoices
                </div>
              </div>
            )}

            {/* Average Invoice Value */}
            {vendorsWithInvoices > 0 && (
              <div className="vendor-metric-average">
                <div className="vendor-metric-average-label">
                  Avg. Invoice per Vendor
                </div>
                <div className="vendor-metric-average-amount">
                  ${avgInvoiceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="vendor-metric-average-details">
                  {vendorsWithInvoices} vendors with invoices
                </div>
              </div>
            )}

            {/* Top Vendors by Invoice Amount */}
            {topVendorsByAmount.length > 0 && (
              <div className="vendor-top-vendors-section">
                <h4 className="vendor-top-vendors-title">
                  Top Vendors by Total
                </h4>
                <div className="vendor-top-vendors-list">
                  {topVendorsByAmount.map((vendor, index) => (
                    <div 
                      key={vendor.vendorID}
                      onClick={() => { setDetailVendorId(vendor.vendorID); setShowDetailModal(true); }}
                      className="vendor-top-vendor-item"
                    >
                      <div className="vendor-top-vendor-header">
                        <div className={`vendor-top-vendor-rank rank-${index + 1}`}>
                          {index + 1}
                        </div>
                        <div className="vendor-top-vendor-name">
                          {vendor.vendorName}
                        </div>
                      </div>
                      <div className="vendor-top-vendor-amount">
                        ${vendor.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="vendor-top-vendor-details">
                        {vendor.totalInvoices} invoice{vendor.totalInvoices !== 1 ? 's' : ''}
                        {vendor.outstandingAmount > 0 && (
                          <span className="vendor-top-vendor-outstanding">
                            {' '}• ${vendor.outstandingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} due
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Vendors Alert */}
            {inactiveVendors.length > 0 && (
              <div className="vendor-inactive-alert">
                <div className="vendor-inactive-alert-label">
                  ⚠ Inactive Vendors
                </div>
                <div className="vendor-inactive-alert-count">
                  {inactiveVendors.length}
                </div>
                <div className="vendor-inactive-alert-note">
                  Consider reviewing or removing
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {(isAddingVendor || selectedVendor) && (
        <VendorForm
          vendor={selectedVendor}
          onClose={handleFormClose}
        />
      )}

      {showDetailModal && detailVendorId && (
        <VendorDetailModal
          vendor={vendors.find(v => v.vendorID === detailVendorId)}
          onClose={closeDetailModal}
          onEdit={() => {
            const vendor = vendors.find(v => v.vendorID === detailVendorId);
            setSelectedVendor(vendor);
            setIsAddingVendor(false);
            setShowDetailModal(false);
          }}
          onToggleStatus={toggleVendorStatus}
          onGenerateToken={generateToken}
        />
      )}

      {showTokenModal && tokenData && (
        <TokenModal
          tokenData={tokenData}
          onClose={closeTokenModal}
        />
      )}
    </>
  );
}
