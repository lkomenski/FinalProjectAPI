namespace FinalProjectAPI.Models
{
    public class AdminDashboardModel
    {
        public int TotalCustomers { get; set; }
        public int TotalVendors { get; set; }
        public int ActiveVendors { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalSales { get; set; }
        public decimal TotalOutstandingInvoices { get; set; }

        public List<AdminVendorSummary>? Vendors { get; set; }
        public List<AdminProductSummary>? Products { get; set; }
    }

    public class AdminVendorSummary
    {
        public int VendorID { get; set; }
        public string? VendorName { get; set; }
        public string? VendorCity { get; set; }
        public string? VendorState { get; set; }
        public DateTime? DateUpdated { get; set; }
        public bool IsActive { get; set; }
    }

    public class AdminProductSummary
    {
        public int ProductID { get; set; }
        public string? ProductName { get; set; }
        public decimal ListPrice { get; set; }
        public int StockQuantity { get; set; }
        public int CategoryID { get; set; }
        public string? CategoryName { get; set; }
    }
}
