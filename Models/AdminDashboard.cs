namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents the dashboard data for administrators with system-wide metrics.
    /// </summary>
    public class AdminDashboardModel
    {
        /// <summary>
        /// Gets or sets the total number of customers in the system.
        /// </summary>
        public int TotalCustomers { get; set; }

        /// <summary>
        /// Gets or sets the total number of vendors in the system.
        /// </summary>
        public int TotalVendors { get; set; }

        /// <summary>
        /// Gets or sets the number of active vendors.
        /// </summary>
        public int ActiveVendors { get; set; }

        /// <summary>
        /// Gets or sets the total number of products in the inventory.
        /// </summary>
        public int TotalProducts { get; set; }

        /// <summary>
        /// Gets or sets the total sales revenue.
        /// </summary>
        public decimal TotalSales { get; set; }

        /// <summary>
        /// Gets or sets the total amount of outstanding invoices.
        /// </summary>
        public decimal TotalOutstandingInvoices { get; set; }

        /// <summary>
        /// Gets or sets the list of vendor summaries.
        /// </summary>
        public List<AdminVendorSummary>? Vendors { get; set; }

        /// <summary>
        /// Gets or sets the list of product summaries.
        /// </summary>
        public List<AdminProductSummary>? Products { get; set; }
    }

    /// <summary>
    /// Represents a summary of vendor information for the admin dashboard.
    /// </summary>
    public class AdminVendorSummary
    {
        /// <summary>
        /// Gets or sets the unique identifier for the vendor.
        /// </summary>
        public int VendorID { get; set; }

        /// <summary>
        /// Gets or sets the vendor's name.
        /// </summary>
        public string? VendorName { get; set; }

        /// <summary>
        /// Gets or sets the vendor's city.
        /// </summary>
        public string? VendorCity { get; set; }

        /// <summary>
        /// Gets or sets the vendor's state.
        /// </summary>
        public string? VendorState { get; set; }

        /// <summary>
        /// Gets or sets the last update date for the vendor information.
        /// </summary>
        public DateTime? DateUpdated { get; set; }

        /// <summary>
        /// Gets or sets whether the vendor is currently active.
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Represents a summary of product information for the admin dashboard.
    /// </summary>
    public class AdminProductSummary
    {
        /// <summary>
        /// Gets or sets the unique identifier for the product.
        /// </summary>
        public int ProductID { get; set; }

        /// <summary>
        /// Gets or sets the product name.
        /// </summary>
        public string? ProductName { get; set; }

        /// <summary>
        /// Gets or sets the list price of the product.
        /// </summary>
        public decimal ListPrice { get; set; }

        /// <summary>
        /// Gets or sets the current stock quantity.
        /// </summary>
        public int StockQuantity { get; set; }

        /// <summary>
        /// Gets or sets the category identifier for the product.
        /// </summary>
        public int CategoryID { get; set; }

        /// <summary>
        /// Gets or sets the category name.
        /// </summary>
        public string? CategoryName { get; set; }
    }
}
