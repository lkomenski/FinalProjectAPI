namespace FinalProjectAPI.Models
{
    public class DashboardSummary
    {
        public int TotalCustomers { get; set; }
        public int TotalVendors { get; set; }
        public int TotalInvoices { get; set; }
        public decimal TotalInvoiced { get; set; }
        public decimal OutstandingBalance { get; set; }
        public decimal AverageInvoice { get; set; }
        public string? MostRecentVendor { get; set; }
        public string? RecentVendorCity { get; set; }
        public string? RecentVendorState { get; set; }
        public string? RecentVendorPhone { get; set; }
        public IEnumerable<InvoiceAging>? AgingSummary { get; set; }
    }

    public class InvoiceAging
    {
        public string AgingBucket { get; set; } = string.Empty;
        public int InvoiceCount { get; set; }
        public decimal OutstandingAmount { get; set; }
    }
}
