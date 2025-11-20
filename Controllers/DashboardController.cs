using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for retrieving dashboard data for different user roles.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDataRepository _repoGuitarShop;
        private readonly IDataRepository _repoAP;

        /// <summary>
        /// Initializes a new instance of the DashboardController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public DashboardController(IDataRepositoryFactory factory)
        {
            _repoGuitarShop = factory.Create("MyGuitarShop");
            _repoAP = factory.Create("AP");
        }

        // ------------------------------------------------------------
        // CUSTOMER DASHBOARD
        // ------------------------------------------------------------
        /// <summary>
        /// Retrieves dashboard data for a specific customer including orders and personal information.
        /// </summary>
        /// <param name="customerId">The ID of the customer.</param>
        /// <returns>Customer dashboard with order history and account details.</returns>
        /// <response code="200">Returns the customer dashboard data.</response>
        /// <response code="404">If the customer is not found.</response>
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerDashboard(int customerId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", customerId }
            };

            var results = await _repoGuitarShop.GetDataAsync("GetCustomerDashboard", parameters);

            if (!results.Any())
                return NotFound("Customer not found.");

            var header = results.First();

            var dashboard = new CustomerDashboard
            {
                CustomerID = customerId,
                FirstName = header["FirstName"]?.ToString(),
                LastName = header["LastName"]?.ToString(),
                EmailAddress = header["EmailAddress"]?.ToString(),
                ShippingCity = header["ShippingCity"]?.ToString(),
                ShippingState = header["ShippingState"]?.ToString(),
                ShippingZip = header["ShippingZip"]?.ToString(),
                Orders = new List<CustomerOrderSummary>()
            };

            foreach (var row in results.Skip(1))
            {
                if (row.ContainsKey("OrderID"))
                {
                    dashboard.Orders.Add(new CustomerOrderSummary
                    {
                        OrderID = Convert.ToInt32(row["OrderID"]),
                        OrderDate = Convert.ToDateTime(row["OrderDate"]),
                        Subtotal = Convert.ToDecimal(row["Subtotal"]),
                        TotalDiscount = Convert.ToDecimal(row["TotalDiscount"]),
                        TaxAmount = Convert.ToDecimal(row["TaxAmount"]),
                        ShipAmount = Convert.ToDecimal(row["ShipAmount"]),
                        OrderTotal = Convert.ToDecimal(row["TotalAmount"]),
                        ItemsCount = Convert.ToInt32(row["ItemsCount"])
                    });
                }
            }

            return Ok(dashboard);
        }

        // ------------------------------------------------------------
        // VENDOR DASHBOARD
        // ------------------------------------------------------------
        /// <summary>
        /// Retrieves dashboard data for a specific vendor including invoice summaries and recent activity.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor.</param>
        /// <returns>Vendor dashboard with invoice data and vendor information.</returns>
        /// <response code="200">Returns the vendor dashboard data.</response>
        /// <response code="404">If the vendor is not found.</response>
        [HttpGet("vendor/{vendorId}")]
        public async Task<IActionResult> GetVendorDashboard(int vendorId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@VendorID", vendorId }
            };

            var results = await _repoAP.GetDataAsync("GetVendorDashboard", parameters);

            if (!results.Any())
                return NotFound("Vendor not found.");

            var first = results.First();

            // -------------------------------
            // Vendor Info
            // -------------------------------
            var vendorInfo = new
            {
                VendorID = vendorId,
                VendorName = first["VendorName"]?.ToString(),
                VendorAddress1 = first.ContainsKey("VendorAddress1") ? first["VendorAddress1"]?.ToString() : null,
                VendorAddress2 = first.ContainsKey("VendorAddress2") ? first["VendorAddress2"]?.ToString() : null,
                VendorCity = first["VendorCity"]?.ToString(),
                VendorState = first["VendorState"]?.ToString(),
                VendorZipCode = first.ContainsKey("VendorZipCode") ? first["VendorZipCode"]?.ToString() : null,
                VendorContactFName = first["VendorContactFName"]?.ToString(),
                VendorContactLName = first["VendorContactLName"]?.ToString(),
                VendorPhone = first.ContainsKey("VendorPhone") ? first["VendorPhone"]?.ToString() : "N/A",
                DefaultTermsID = first.ContainsKey("DefaultTermsID") ? first["DefaultTermsID"] : DBNull.Value,
                DefaultAccountNo = first.ContainsKey("DefaultAccountNo") ? first["DefaultAccountNo"] : DBNull.Value,
                TermsDescription = first.ContainsKey("TermsDescription") ? first["TermsDescription"]?.ToString() : "N/A",
                DateUpdated = first.ContainsKey("DateUpdated") ? first["DateUpdated"] : DBNull.Value
            };

            // -------------------------------
            // Invoice Summary
            // -------------------------------
            // Filter out rows where InvoiceID is NULL or 0 (no actual invoice)
            var invoiceRows = results.Where(r => r["InvoiceID"] != DBNull.Value && Convert.ToInt32(r["InvoiceID"]) > 0).ToList();
            
            var invoiceSummary = new
            {
                TotalInvoices = invoiceRows.Count(),
                TotalOutstanding = invoiceRows.Sum(r => Convert.ToDecimal(r["InvoiceTotal"]) -
                                                    Convert.ToDecimal(r["PaymentTotal"]) -
                                                    Convert.ToDecimal(r["CreditTotal"])),
                TotalPaid = invoiceRows.Sum(r => Convert.ToDecimal(r["PaymentTotal"]) +
                                             Convert.ToDecimal(r["CreditTotal"]))
            };

            // -------------------------------
            // Recent Invoices (Top 5)
            // -------------------------------
            var recentInvoices = invoiceRows
                .Select(r => new
                {
                    InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                    InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                    InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                    InvoiceTotal = Convert.ToDecimal(r["InvoiceTotal"]),
                    PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                    CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                    InvoiceDueDate = r["InvoiceDueDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["InvoiceDueDate"]),
                    PaymentDate = r["PaymentDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["PaymentDate"]),
                    InvoiceStatus = r.ContainsKey("InvoiceStatus") ? r["InvoiceStatus"]?.ToString() : "Unknown",
                    TermsDescription = r["TermsDescription"]?.ToString()
                })
                .ToList();


            return Ok(new
            {
                vendor = vendorInfo,
                invoiceSummary = invoiceSummary,
                recentInvoices = recentInvoices
            });
        }

        // ------------------------------------------------------------
        // ADMIN DASHBOARD
        // ------------------------------------------------------------
        /// <summary>
        /// Retrieves comprehensive dashboard data for administrators including all vendors, products, and business metrics.
        /// </summary>
        /// <returns>Admin dashboard with system-wide statistics, vendor list, and product list.</returns>
        /// <response code="200">Returns the admin dashboard data.</response>
        /// <response code="500">If there is a server error while retrieving dashboard data.</response>
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                var summaryRows = await _repoGuitarShop.GetDataAsync("GetEmployeeDashboard");
                var summary = summaryRows.FirstOrDefault();

                if (summary is null)
                    return StatusCode(500, "Admin summary data missing.");

                // Only return summary statistics for dashboard charts
                // Full lists can be fetched by dedicated management endpoints
                return Ok(new
                {
                    totalCustomers = Convert.ToInt32(summary["TotalCustomers"] ?? 0),
                    activeCustomers = Convert.ToInt32(summary["ActiveCustomers"] ?? 0),
                    totalVendors = Convert.ToInt32(summary["TotalVendors"] ?? 0),
                    activeVendors = Convert.ToInt32(summary["ActiveVendors"] ?? 0),
                    totalProducts = Convert.ToInt32(summary["TotalProducts"] ?? 0),
                    totalSales = Convert.ToDecimal(summary["TotalSales"] ?? 0),
                    totalOutstandingInvoices = Convert.ToDecimal(summary["TotalOutstandingInvoices"] ?? 0)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to load admin dashboard: {ex.Message}");
            }
        }
    }
}
