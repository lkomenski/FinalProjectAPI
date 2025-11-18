import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchData } from "./Api";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../Styles/Dashboard.css";

export default function SalesDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(location.state?.filter || "all");
  const [sortBy, setSortBy] = useState("invoiceDate");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadInvoices = useCallback(async () => {
    try {
      const data = await fetchData("invoices");
      setInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (err) {
      setError(err.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Filter and search invoices
  useEffect(() => {
    let list = [...invoices];

    // Apply status filter
    if (statusFilter === "paid") {
      list = list.filter(inv => inv.isPaid || inv.amountDue === 0);
    } else if (statusFilter === "unpaid") {
      list = list.filter(inv => !inv.isPaid && inv.amountDue > 0);
    } else if (statusFilter === "partial") {
      list = list.filter(inv => !inv.isPaid && inv.amountDue > 0 && inv.amountDue < inv.totalAmount);
    }

    // Apply search
    if (searchTerm.trim() !== "") {
      const s = searchTerm.toLowerCase();
      list = list.filter(inv =>
        inv.invoiceID?.toString().includes(s) ||
        inv.customerName?.toLowerCase().includes(s) ||
        inv.vendorName?.toLowerCase().includes(s)
      );
    }

    // Apply sorting
    if (sortBy) {
      list.sort((a, b) => {
        if (sortBy === "invoiceDate" || sortBy === "dueDate") {
          return new Date(b[sortBy]) - new Date(a[sortBy]);
        } else if (sortBy === "totalAmount" || sortBy === "amountDue") {
          return b[sortBy] - a[sortBy];
        }
        return 0;
      });
    }

    setFilteredInvoices(list);
    setCurrentPage(1);
  }, [invoices, searchTerm, statusFilter, sortBy]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handleInvoiceClick = async (invoiceId) => {
    try {
      const data = await fetchData(`invoices/${invoiceId}`);
      setSelectedInvoice(data);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Failed to load invoice details.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  // Calculate summary stats
  const totalSales = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const paidInvoices = invoices.filter(inv => inv.isPaid || inv.amountDue === 0).length;
  const unpaidInvoices = invoices.filter(inv => !inv.isPaid && inv.amountDue > 0).length;

  // Prepare chart data - Sales by Category
  const getCategoryData = () => {
    const categoryMap = {};
    invoices.forEach(inv => {
      if (inv.lineItems && Array.isArray(inv.lineItems)) {
        inv.lineItems.forEach(item => {
          const category = item.category || 'Uncategorized';
          const amount = (item.quantity || 0) * (item.unitPrice || 0);
          categoryMap[category] = (categoryMap[category] || 0) + amount;
        });
      }
    });
    
    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  // Prepare chart data - Sales Trend (last 6 months)
  const getSalesTrendData = () => {
    const monthMap = {};
    const months = [];
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthMap[key] = 0;
      months.push(key);
    }
    
    // Aggregate sales by month
    invoices.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (monthMap.hasOwnProperty(key)) {
        monthMap[key] += inv.totalAmount || 0;
      }
    });
    
    return months.map(month => ({
      month,
      sales: parseFloat(monthMap[month].toFixed(2))
    }));
  };

  const categoryData = getCategoryData();
  const salesTrendData = getSalesTrendData();
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span onClick={() => navigate("/employee-dashboard")} className="breadcrumb-link">Dashboard</span>
        <span className="breadcrumb-separator"> / </span>
        <span className="breadcrumb-current">Sales Dashboard</span>
      </div>

      <h2 className="dashboard-title">Sales Dashboard</h2>

      {/* Summary Cards */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '30px' }}>
        <div className="dashboard-card">
          <h3>Total Sales</h3>
          <div className="value">${totalSales.toFixed(2)}</div>
        </div>
        <div className="dashboard-card">
          <h3>Outstanding</h3>
          <div className="value">${totalOutstanding.toFixed(2)}</div>
        </div>
        <div className="dashboard-card">
          <h3>Paid Invoices</h3>
          <div className="value">{paidInvoices}</div>
        </div>
        <div className="dashboard-card">
          <h3>Unpaid Invoices</h3>
          <div className="value">{unpaidInvoices}</div>
        </div>
      </div>

      {/* Charts Section */}
      <h3 className="dashboard-subtitle">Sales Analytics</h3>
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '30px' }}>
        <div className="dashboard-card" style={{ height: '350px' }}>
          <h3 style={{ marginBottom: '15px' }}>Sales by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#6b7280' }}>
              No category data available
            </div>
          )}
        </div>
        <div className="dashboard-card" style={{ height: '350px' }}>
          <h3 style={{ marginBottom: '15px' }}>Sales Trend (Last 6 Months)</h3>
          {salesTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#6b7280' }}>
              No sales data available
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <h3 className="dashboard-subtitle">Invoice List</h3>
      <div className="filters-row">
        <input 
          className="dashboard-input" 
          placeholder="Search by Invoice ID, Customer, or Vendor..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <select className="dashboard-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Invoices</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partially Paid</option>
        </select>
        <select className="dashboard-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="invoiceDate">Sort by Invoice Date</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="totalAmount">Sort by Total Amount</option>
          <option value="amountDue">Sort by Amount Due</option>
        </select>
      </div>

      {/* Invoice List */}
      <div style={{ marginTop: '20px' }}>
        {currentInvoices.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No invoices found.</p>
        ) : (
          currentInvoices.map((inv) => (
            <div 
              key={inv.invoiceID} 
              className="dashboard-list-item clickable"
              onClick={() => handleInvoiceClick(inv.invoiceID)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <strong>Invoice #{inv.invoiceID}</strong>
                <p>Customer: {inv.customerName || 'N/A'} | Vendor: {inv.vendorName || 'N/A'}</p>
                <p>Date: {new Date(inv.invoiceDate).toLocaleDateString()} | Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                <span className={inv.isPaid || inv.amountDue === 0 ? "text-green-700" : "text-red-600"}>
                  {inv.isPaid || inv.amountDue === 0 ? "Paid" : `Outstanding: $${inv.amountDue?.toFixed(2)}`}
                </span>
              </div>
              <div>
                <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  ${inv.totalAmount?.toFixed(2)}
                </div>
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
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
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
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices
      </div>

      {/* Invoice Detail Modal */}
      {showModal && selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={closeModal} />
      )}
    </div>
  );
}
