import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import VendorForm from "./VendorForm";
import VendorDetailModal from "./VendorDetailModal";
import TokenModal from "./TokenModal";
import "../Styles/Dashboard.css";

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
    <div style={{ display: 'flex', gap: '25px', padding: '30px', maxWidth: '100%' }}>
      {/* Left Panel - Quick Tips & Recently Added */}
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          {/* Quick Tip */}
          <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: '600', color: '#1e40af' }}>
              Quick Tip
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#3b82f6', lineHeight: '1.4' }}>
              Generate tokens for vendors to allow them to view and manage their invoices through the vendor portal.
            </p>
          </div>

          {/* Recently Added Vendors */}
          {recentVendors.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
                Recently Added
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentVendors.map((vendor) => (
                  <div 
                    key={vendor.vendorID}
                    onClick={() => { setDetailVendorId(vendor.vendorID); setShowDetailModal(true); }}
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
                      {vendor.vendorName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {vendor.vendorCity}, {vendor.vendorState}
                    </div>
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.7rem',
                      color: vendor.isActive ? '#059669' : '#6b7280',
                      fontWeight: '500'
                    }}>
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
      <div style={{ flex: 1 }}>
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
          <div style={{ marginTop: '20px' }}>
        {currentVendors.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No vendors found.</p>
        ) : (
          currentVendors.map((v) => (
            <div 
              key={v.vendorID} 
              className="dashboard-list-item"
              onClick={() => openVendorDetail(v.vendorID)}
              style={{ cursor: 'pointer' }}
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
      <div style={{ width: '320px', flexShrink: 0 }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Vendor Metrics
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Active vs Total Vendors */}
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#059669', marginBottom: '8px' }}>
                Active Vendors
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                  {activeVendors.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  / {vendors.length} total
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '4px' }}>
                {vendors.length > 0 ? ((activeVendors.length / vendors.length) * 100).toFixed(0) : 0}% of network
              </div>
            </div>

            {/* Outstanding Balances */}
            {vendorsWithBalance.length > 0 && (
              <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#d97706', marginBottom: '8px' }}>
                  Outstanding Balances
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#d97706' }}>
                  ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '4px' }}>
                  {vendorsWithBalance.length} vendor{vendorsWithBalance.length !== 1 ? 's' : ''} with unpaid invoices
                </div>
              </div>
            )}

            {/* Average Invoice Value */}
            {vendorsWithInvoices > 0 && (
              <div style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', marginBottom: '8px' }}>
                  Avg. Invoice per Vendor
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>
                  ${avgInvoiceValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                  {vendorsWithInvoices} vendors with invoices
                </div>
              </div>
            )}

            {/* Top Vendors by Invoice Amount */}
            {topVendorsByAmount.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: '600', color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                  Top Vendors by Total
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topVendorsByAmount.map((vendor, index) => (
                    <div 
                      key={vendor.vendorID}
                      onClick={() => { setDetailVendorId(vendor.vendorID); setShowDetailModal(true); }}
                      style={{
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ 
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7f32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          color: 'white'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: '600', color: '#111827' }}>
                          {vendor.vendorName}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#059669', marginLeft: '28px' }}>
                        ${vendor.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginLeft: '28px' }}>
                        {vendor.totalInvoices} invoice{vendor.totalInvoices !== 1 ? 's' : ''}
                        {vendor.outstandingAmount > 0 && (
                          <span style={{ color: '#d97706', fontWeight: '500' }}>
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
              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '500', color: '#dc2626', marginBottom: '4px' }}>
                  ⚠ Inactive Vendors
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626' }}>
                  {inactiveVendors.length}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', marginTop: '2px' }}>
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
