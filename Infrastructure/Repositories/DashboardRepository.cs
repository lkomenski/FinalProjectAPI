using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Infrastructure.Repositories;
using FinalProjectAPI.Models;


namespace FinalProjectAPI.Infrastructure.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly SqlDataRepository _sqlData;
        public DashboardRepository(SqlDataRepository sqlData)
        {
            _sqlData = sqlData;
        }

        public async Task<DashboardSummary> GetDashboardSummaryAsync()
        {
            // Get the main dashboard data
            var summaryResults = await _sqlData.GetDataAsync("GetDashboardSummary");
            var summaryRow = summaryResults.FirstOrDefault();

            if (summaryRow == null) throw new Exception("No dashboard summary data found.");

            // Get aging details (nested SP output)
            var agingResults = await _sqlData.GetDataAsync("GetInvoiceAgingSummary");

            var agingList = agingResults.Select(row => new InvoiceAging
            {
                AgingBucket = row["AgingBucket"]?.ToString() ?? "",
                InvoiceCount = Convert.ToInt32(row["InvoiceCount"]),
                OutstandingAmount = Convert.ToDecimal(row["OutstandingAmount"])
            }).ToList();

            return new DashboardSummary
            {
                TotalCustomers = Convert.ToInt32(summaryRow["TotalCustomers"]),
                TotalVendors = Convert.ToInt32(summaryRow["TotalVendors"]),
                TotalInvoices = Convert.ToInt32(summaryRow["TotalInvoices"]),
                TotalInvoiced = Convert.ToDecimal(summaryRow["TotalInvoiced"]),
                OutstandingBalance = Convert.ToDecimal(summaryRow["OutstandingBalance"]),
                AverageInvoice = Convert.ToDecimal(summaryRow["AverageInvoice"]),
                MostRecentVendor = summaryRow["MostRecentVendor"]?.ToString(),
                RecentVendorCity = summaryRow["RecentVendorCity"]?.ToString(),
                RecentVendorState = summaryRow["RecentVendorState"]?.ToString(),
                RecentVendorPhone = summaryRow["RecentVendorPhone"]?.ToString(),
                AgingSummary = agingList
            };
        }
    }
}
