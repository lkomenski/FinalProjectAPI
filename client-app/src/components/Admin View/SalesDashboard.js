import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Api from "../shared/Api";
import LoadingSpinner from "../shared/LoadingSpinner";
import ErrorMessage from "../shared/ErrorMessage";
import InvoiceDetailModal from "../InvoiceDetailModal";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../Styles/Dashboard.css";

export default function SalesDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceListRef = useRef(null);
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
  const [dateRange, setDateRange] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const loadInvoices = useCallback(async () => {
    try {
      const data = await Api.get("/api/invoices");
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
      const data = await Api.get(`/api/invoices/${invoiceId}`);
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

  // Memoize summary stats - only recalculate when invoices change
  const totalSales = useMemo(() => 
    invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    [invoices]
  );

  const totalOutstanding = useMemo(() => 
    invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0),
    [invoices]
  );

  const paidInvoices = useMemo(() => 
    invoices.filter(inv => inv.isPaid || inv.amountDue === 0).length,
    [invoices]
  );

  const unpaidInvoices = useMemo(() => 
    invoices.filter(inv => !inv.isPaid && inv.amountDue > 0).length,
    [invoices]
  );

  // Handler to filter invoices and scroll to list
  const handleCardClick = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
    setTimeout(() => {
      invoiceListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Memoize chart data - Sales by GL Account Category
  const categoryData = useMemo(() => {
    const categoryMap = {};
    
    // Aggregate by line item description from invoices
    invoices.forEach(inv => {
      if (inv.lineItems && Array.isArray(inv.lineItems) && inv.lineItems.length > 0) {
        inv.lineItems.forEach(item => {
          const category = item.invoiceLineItemDescription || 'Uncategorized';
          const amount = item.invoiceLineItemAmount || 0;
          categoryMap[category] = (categoryMap[category] || 0) + amount;
        });
      } else {
        // Fallback: group by vendor if no line items available yet
        const vendor = inv.vendorName || 'Unknown';
        categoryMap[vendor] = (categoryMap[vendor] || 0) + (inv.totalAmount || 0);
      }
    });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [invoices]);

  // Memoize chart data - Sales Trend with date range filter
  const salesTrendData = useMemo(() => {
    let filteredData = [...invoices];
    
    // Apply date range filter
    const now = new Date();
    if (dateRange === "6months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      filteredData = filteredData.filter(inv => new Date(inv.invoiceDate) >= sixMonthsAgo);
    } else if (dateRange === "1year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filteredData = filteredData.filter(inv => new Date(inv.invoiceDate) >= oneYearAgo);
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filteredData = filteredData.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate >= start && invDate <= end;
      });
    }
    
    // Group by month
    const monthMap = {};
    filteredData.forEach(inv => {
      const date = new Date(inv.invoiceDate);
      const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthMap[key] = (monthMap[key] || 0) + (inv.totalAmount || 0);
    });
    
    // Sort by date
    return Object.entries(monthMap)
      .map(([month, sales]) => ({ month, sales: parseFloat(sales.toFixed(2)) }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA - dateB;
      });
  }, [invoices, dateRange, customStartDate, customEndDate]);
  
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

      <div className="sales-dashboard-header">
        <h2 className="dashboard-title sales-dashboard-title">Sales Dashboard</h2>
        <button 
          onClick={() => navigate("/invoice-archive")}
          className="dashboard-btn dashboard-btn-secondary"
        >
          View Invoice Archive
        </button>
      </div>

      {/* Summary Cards - Clickable */}
      <div className="dashboard-grid sales-dashboard-grid">
        <div className="dashboard-card dashboard-clickable" onClick={() => handleCardClick("all")}>
          <h3>Total Sales</h3>
          <div className="value">${totalSales.toFixed(2)}</div>
        </div>
        <div className="dashboard-card dashboard-clickable" onClick={() => handleCardClick("unpaid")}>
          <h3>Outstanding</h3>
          <div className="value">${totalOutstanding.toFixed(2)}</div>
        </div>
        <div className="dashboard-card dashboard-clickable" onClick={() => handleCardClick("paid")}>
          <h3>Paid Invoices</h3>
          <div className="value">{paidInvoices}</div>
        </div>
        <div className="dashboard-card dashboard-clickable" onClick={() => handleCardClick("unpaid")}>
          <h3>Unpaid Invoices</h3>
          <div className="value">{unpaidInvoices}</div>
        </div>
      </div>

      {/* Charts Section */}
      <h3 className="dashboard-subtitle">Sales Analytics</h3>
      <div className="dashboard-grid sales-charts-grid">
        <div className="dashboard-card sales-chart-card">
          <h3 className="sales-chart-title">Sales by Item Description</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={330}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ maxWidth: '200px', whiteSpace: 'normal', wordWrap: 'break-word' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="sales-no-data">
              No category data available
            </div>
          )}
        </div>
        <div className="dashboard-card sales-chart-card">
          <div className="sales-chart-header">
            <h3 className="sales-chart-header-title">Sales Trend</h3>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="filter-select sales-date-range-select"
            >
              <option value="all">All Time</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateRange === "custom" && (
            <div className="sales-custom-date-range">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="dashboard-input sales-custom-date-input"
              />
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="dashboard-input sales-custom-date-input"
              />
            </div>
          )}
          {salesTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={dateRange === "custom" ? 270 : 330}>
              <BarChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="sales-no-data">
              No sales data available for selected range
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <h3 className="dashboard-subtitle" ref={invoiceListRef}>Invoice List</h3>
      <div className="filters-row">
        <input 
          className="dashboard-input" 
          placeholder="Search by Invoice #, or Vendor..." 
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

      {/* Invoice List - Vendor Dashboard Style */}
      <div className="sales-invoice-list-section">
        {currentInvoices.length === 0 ? (
          <p className="sales-no-invoices">No invoices found.</p>
        ) : (
          currentInvoices.map((inv) => (
            <div 
              key={inv.invoiceID} 
              className="dashboard-list-item dashboard-clickable sales-invoice-item"
              onClick={() => handleInvoiceClick(inv.invoiceID)}
            >
              <div>
                <strong>Invoice #{inv.invoiceNumber || inv.invoiceID}</strong><br />
                Vendor: {inv.vendorName || 'N/A'}<br />
                Date: {new Date(inv.invoiceDate).toLocaleDateString()}<br />
                Total: ${inv.totalAmount?.toFixed(2)}
              </div>
              
              {/* STATUS BADGE - Right Side, Larger */}
              <span
                className={
                  inv.isPaid || inv.amountDue === 0
                    ? "badge badge-paid sales-status-badge"
                    : inv.amountDue > 0 && inv.amountDue < inv.totalAmount
                    ? "badge badge-partial sales-status-badge"
                    : "badge badge-unpaid sales-status-badge"
                }
              >
                {inv.isPaid || inv.amountDue === 0
                  ? "Paid"
                  : inv.amountDue > 0 && inv.amountDue < inv.totalAmount
                  ? "Partial"
                  : "Unpaid"}
              </span>
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
