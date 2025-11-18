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
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.vendorName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "paid" && inv.isPaid) ||
        (statusFilter === "unpaid" && !inv.isPaid);
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    switch (sortBy) {
      case "date":
        sorted.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));
        break;
      case "amount":
        sorted.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "vendor":
        sorted.sort((a, b) => (a.vendorName || "").localeCompare(b.vendorName || ""));
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
      const detail = await Api.get(`/api/invoices/archived/${invoice.invoiceID}`);
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
          <button onClick={() => navigate("/dashboard")} className="dashboard-btn dashboard-btn-secondary">
            ← Back to Dashboard
          </button>
          <h1>Invoice Archive</h1>
          <p>View historical invoices</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      <div className="filters-row" style={{ marginTop: '30px' }}>
        <input
          type="text"
          placeholder="Search by invoice # or vendor..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="vendor">Sort by Vendor</option>
        </select>
      </div>

      {/* Invoice List */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Vendor</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Amount Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No archived invoices found
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((invoice) => (
                <tr
                  key={invoice.invoiceID}
                  onClick={() => handleInvoiceClick(invoice)}
                  style={{ cursor: 'pointer' }}
                  className="table-row-hover"
                >
                  <td>{invoice.invoiceNumber || `#${invoice.invoiceID}`}</td>
                  <td>{invoice.vendorName || 'N/A'}</td>
                  <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td>
                    {invoice.dueDate
                      ? new Date(invoice.dueDate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>${invoice.totalAmount?.toFixed(2)}</td>
                  <td className={invoice.amountDue > 0 ? 'text-danger' : ''}>
                    ${invoice.amountDue?.toFixed(2)}
                  </td>
                  <td>
                    <span className={invoice.isPaid ? 'status-paid' : 'status-unpaid'}>
                      {invoice.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
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
