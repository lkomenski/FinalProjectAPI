import React, { useEffect, useState } from "react";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import InvoiceDetailModal from "./InvoiceDetailModal";
import "../Styles/Dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";

export default function VendorInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("date-desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const vendorId = user?.id;

  useEffect(() => {
    async function loadInvoices() {
      try {
        if (!vendorId) {
          setError("No vendor logged in.");
          return;
        }

        const data = await fetchData(`dashboard/vendor/${vendorId}`);

        setVendorName(data.vendor.vendorName);
        setInvoices(data.recentInvoicesFull || data.recentInvoices || []);

        // Check if we have a filter from navigation state
        if (location.state?.filter) {
          setStatusFilter(location.state.filter);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, [vendorId, location.state]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // -------------------------
  // Invoice “status”
  // -------------------------
  const getStatus = (inv) => {
    if (!inv.paymentTotal && !inv.creditTotal) return "unpaid";
    if (inv.paymentDate) return "paid";
    if ((inv.creditTotal ?? 0) + (inv.paymentTotal ?? 0) >= inv.invoiceTotal)
      return "paid";

    return "unpaid";
  };

  // Badge UI
  const StatusBadge = ({ status }) => (
    <span
      className={
        status === "paid"
          ? "badge-paid"
          : "badge-unpaid"
      }
    >
      {status.toUpperCase()}
    </span>
  );

  // -------------------------
  // Sorting Handler
  // -------------------------
  const sortInvoices = (list, mode) => {
    switch (mode) {
      case "date-desc":
        return [...list].sort(
          (a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate)
        );

      case "date-asc":
        return [...list].sort(
          (a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate)
        );

      case "total-desc":
        return [...list].sort(
          (a, b) => b.invoiceTotal - a.invoiceTotal
        );

      case "total-asc":
        return [...list].sort(
          (a, b) => a.invoiceTotal - b.invoiceTotal
        );

      case "status":
        return [...list].sort((a, b) =>
          getStatus(a).localeCompare(getStatus(b))
        );

      default:
        return list;
    }
  };

  // -------------------------
  // Filtering Handler
  // -------------------------
  const filterInvoices = (list) => {
    return list.filter((inv) => {
      // Status filter
      if (statusFilter !== "all") {
        const status = getStatus(inv);
        if (status !== statusFilter) return false;
      }

      // Search term filter (invoice number, amount, or line item description)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesNumber = inv.invoiceNumber?.toString().toLowerCase().includes(searchLower);
        const matchesAmount = inv.invoiceTotal?.toString().includes(searchTerm);
        
        // Search in line items if available
        const matchesLineItem = inv.lineItems?.some(item => 
          item.accountDescription?.toLowerCase().includes(searchLower) ||
          item.invoiceLineItemDescription?.toLowerCase().includes(searchLower)
        );
        
        if (!matchesNumber && !matchesAmount && !matchesLineItem) return false;
      }

      // Date range filter
      if (dateFrom) {
        const invDate = new Date(inv.invoiceDate);
        const fromDate = new Date(dateFrom);
        if (invDate < fromDate) return false;
      }

      if (dateTo) {
        const invDate = new Date(inv.invoiceDate);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59); // Include entire day
        if (invDate > toDate) return false;
      }

      return true;
    });
  };

  const filteredInvoices = filterInvoices(invoices);
  const sortedInvoices = sortInvoices(filteredInvoices, sortField);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = sortedInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInvoiceClick = async (invoiceId) => {
    setLoadingInvoice(true);
    try {
      const data = await fetchData(`invoices/${invoiceId}`);
      setSelectedInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice details:", err);
      alert("Failed to load invoice details. Please try again.");
    } finally {
      setLoadingInvoice(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const money = (n) =>
    typeof n === "number" ? n.toFixed(2) : "0.00";

  // Calculate analytics
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.invoiceTotal || 0), 0);
  const paidInvoices = invoices.filter(inv => getStatus(inv) === "paid");
  const unpaidInvoices = invoices.filter(inv => getStatus(inv) === "unpaid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.invoiceTotal || 0), 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.invoiceTotal || 0), 0);
  
  // Calculate average invoice amount
  const avgInvoiceAmount = invoices.length > 0 ? totalInvoiceAmount / invoices.length : 0;
  
  // Find oldest unpaid invoice
  const oldestUnpaid = unpaidInvoices.length > 0 
    ? unpaidInvoices.reduce((oldest, inv) => 
        new Date(inv.invoiceDate) < new Date(oldest.invoiceDate) ? inv : oldest
      )
    : null;

  return (
    <>
      {selectedInvoice && (
        <InvoiceDetailModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
      
      {loadingInvoice && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999 
        }}>
          <LoadingSpinner />
        </div>
      )}

      <div style={{ display: 'flex', gap: '0px', padding: '30px 200px 30px 50px', maxWidth: '100%' }}>
      {/* Left Panel - Analytics */}
      <div style={{ width: '300px', flexShrink: 0, marginTop: '145px' }}>
        <div className="dashboard-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
            Invoice Summary
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Total Invoices */}
            <div style={{ padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '5px', fontWeight: '500' }}>Total Invoices</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>{invoices.length}</div>
            </div>

            {/* Total Amount */}
            <div style={{ padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '5px', fontWeight: '500' }}>Total Amount</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>${money(totalInvoiceAmount)}</div>
            </div>

            {/* Unpaid Amount */}
            {totalUnpaid > 0 && (
              <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                <div style={{ fontSize: '0.75rem', color: '#d97706', marginBottom: '5px', fontWeight: '500' }}>Outstanding</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d97706' }}>${money(totalUnpaid)}</div>
                <div style={{ fontSize: '0.7rem', color: '#92400e', marginTop: '4px' }}>
                  {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Average Invoice */}
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '5px', fontWeight: '500' }}>Average Invoice</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>${money(avgInvoiceAmount)}</div>
            </div>

            {/* Oldest Unpaid */}
            {oldestUnpaid && (
              <div style={{ marginTop: '10px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '5px', fontWeight: '500' }}>⚠ Oldest Unpaid</div>
                <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: '600' }}>#{oldestUnpaid.invoiceNumber}</div>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', marginTop: '2px' }}>
                  {new Date(oldestUnpaid.invoiceDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: '700', marginTop: '4px' }}>
                  ${money(oldestUnpaid.invoiceTotal)}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: '600', color: '#1e40af' }}>Search Tip</h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#3b82f6', lineHeight: '1.4' }}>
              You can search by invoice number, amount, or line item descriptions to quickly find specific invoices.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="dashboard-container" style={{ paddingLeft: '0' }}>
        {/* Breadcrumbs */}
        <div className="breadcrumbs" style={{ marginBottom: '20px' }}>
          <span className="breadcrumb-link" onClick={() => navigate('/vendor-dashboard')} style={{ cursor: 'pointer', color: '#3b82f6' }}>
            Dashboard
          </span>
          <span className="breadcrumb-separator"> / </span>
          <span className="breadcrumb-current">All Invoices</span>
        </div>

        <h2 className="dashboard-title">Invoices — {vendorName}</h2>

      {/* Filter Controls */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        {/* Search Bar - Full Width */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            className="dashboard-input"
            placeholder="Search by invoice #, amount, or line item description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '90%', fontSize: '0.95rem' }}
          />
        </div>

        {/* Filter Row - Status, Sort, Date Range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>
              Status
            </label>
            <select
              className="dashboard-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>
              Sort By
            </label>
            <select
              className="dashboard-select"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="total-desc">$ High-Low</option>
              <option value="total-asc">$ Low-High</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>
              From Date
            </label>
            <input
              type="date"
              className="dashboard-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.8rem', fontWeight: '500', color: '#6b7280' }}>
              To Date
            </label>
            <input
              type="date"
              className="dashboard-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Results Info and Clear Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {currentInvoices.length} of {sortedInvoices.length} invoices
            {sortedInvoices.length !== invoices.length && ` (filtered from ${invoices.length} total)`}
          </div>
          {(statusFilter !== 'all' || searchTerm || dateFrom || dateTo) && (
            <button 
              onClick={clearFilters}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Invoices List */}
      {sortedInvoices.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
          No invoices found{statusFilter !== 'all' || searchTerm || dateFrom || dateTo ? ' matching your filters' : ''}.
        </p>
      ) : (
        <>
          {currentInvoices.map((inv) => (
            <div
              key={inv.invoiceID}
              className="dashboard-list-item dashboard-clickable"
              onClick={() => handleInvoiceClick(inv.invoiceID)}
            >
              <div>
                <strong>Invoice #{inv.invoiceNumber}</strong> <br />
                Date: {new Date(inv.invoiceDate).toLocaleDateString()} <br />
                Total: ${money(inv.invoiceTotal)} <br />
                Status: {inv.invoiceStatus}
              </div>

              <div>
                <StatusBadge status={getStatus(inv)} />
              </div>
            </div>
          ))}

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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedInvoices.length)} of {sortedInvoices.length} invoices
          </div>
        </>
      )}
      </div>
      </div>
    </div>
    </>
  );
}
