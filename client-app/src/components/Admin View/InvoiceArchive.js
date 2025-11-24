import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Api from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import InvoiceDetailModal from "./InvoiceDetailModal";
import "../Styles/Dashboard.css";

export default function InvoiceArchive() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const itemsPerPage = 10;

  const loadArchivedInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await Api.get("/api/invoices/archived");
      setInvoices(data);
    } catch (err) {
      setError("Failed to load archived invoices. " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArchivedInvoices();
  }, [loadArchivedInvoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        inv.InvoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.VendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "paid" && inv.IsPaid) ||
        (statusFilter === "unpaid" && !inv.IsPaid);
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    switch (sortBy) {
      case "date":
        sorted.sort((a, b) => new Date(b.InvoiceDate) - new Date(a.InvoiceDate));
        break;
      case "amount":
        sorted.sort((a, b) => b.TotalAmount - a.TotalAmount);
        break;
      case "vendor":
        sorted.sort((a, b) => (a.VendorName || "").localeCompare(b.VendorName || ""));
        break;
      default:
        break;
    }
    return sorted;
  }, [filteredInvoices, sortBy]);

  // Paginate invoices
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedInvoices, currentPage]);

  const handleInvoiceClick = async (invoice) => {
    try {
      const detail = await Api.get(`/api/invoices/archived/${invoice.InvoiceID}`);
      setSelectedInvoice(detail);
      setShowModal(true);
    } catch (err) {
      setError("Failed to load invoice details. " + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  // Format money
  const money = (num) =>
    typeof num === "number" ? num.toFixed(2) : "0.00";

  // Status Badge Component
  const StatusBadge = ({ status }) => (
    <span className={status ? "badge-paid" : "badge-unpaid"}>
      {status ? "PAID" : "UNPAID"}
    </span>
  );

  // Pagination with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <button 
            onClick={() => navigate("/dashboard")} 
            className="dashboard-btn dashboard-btn-secondary"
            style={{ marginBottom: '10px' }}
          >
            ← Back to Dashboard
          </button>
          <h2 className="dashboard-title">Invoice Archive</h2>
          <p style={{ color: '#6b7280', marginTop: '5px' }}>View historical invoices</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by invoice # or vendor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="dashboard-input"
          style={{ flex: '1', minWidth: '200px' }}
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="dashboard-select"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="dashboard-select"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="vendor">Sort by Vendor</option>
        </select>
      </div>

      {/* Invoice List */}
      {paginatedInvoices.length === 0 ? (
        <p>No archived invoices found.</p>
      ) : (
        paginatedInvoices.map((invoice) => (
          <div
            key={invoice.InvoiceID}
            className="dashboard-list-item dashboard-clickable"
            onClick={() => handleInvoiceClick(invoice)}
          >
            <div>
              <strong>Invoice #{invoice.InvoiceNumber || invoice.InvoiceID}</strong>
              <br />
              Vendor: {invoice.VendorName || 'N/A'}
              <br />
              Date: {new Date(invoice.InvoiceDate).toLocaleDateString()}
              {invoice.DueDate && (
                <>
                  <br />
                  Due: {new Date(invoice.DueDate).toLocaleDateString()}
                </>
              )}
              <br />
              Total: ${money(invoice.TotalAmount)}
              {invoice.AmountDue > 0 && (
                <>
                  <br />
                  <span style={{ color: '#b00020', fontWeight: '600' }}>
                    Amount Due: ${money(invoice.AmountDue)}
                  </span>
                </>
              )}
            </div>

            <div>
              <StatusBadge status={invoice.IsPaid} />
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-pages">
            {getPageNumbers().map((page, index) => (
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showModal && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={closeModal} />
      )}
    </div>
  );
}
