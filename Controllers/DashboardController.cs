using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDataRepository _repo;

        public DashboardController(IDataRepositoryFactory factory)
        {
            // Use MyGuitarShop by default for customer/admin dashboard data
            _repo = factory.Create("MyGuitarShop");
        }

        // GET api/dashboard/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetCustomerDashboard(int customerId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", customerId }
            };

            var results = await _repo.GetDataAsync("GetCustomerDashboard", parameters);

            if (results.Count() == 0)
                return NotFound("Customer not found.");

            // First row = customer info
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

            // Order rows = everything AFTER the first row
            foreach (var row in results.Skip(1))
            {
                // Protect against no orders
                if (row.ContainsKey("OrderID"))
                {
                    var order = new CustomerOrderSummary
                    {
                        OrderID = Convert.ToInt32(row["OrderID"]),
                        OrderDate = Convert.ToDateTime(row["OrderDate"]),
                        Subtotal = Convert.ToDecimal(row["Subtotal"]),
                        TotalDiscount = Convert.ToDecimal(row["TotalDiscount"]),
                        TaxAmount = Convert.ToDecimal(row["TaxAmount"]),
                        ShipAmount = Convert.ToDecimal(row["ShipAmount"]),
                        OrderTotal = Convert.ToDecimal(row["TotalAmount"]),
                        ItemsCount = Convert.ToInt32(row["ItemsCount"])
                    };

                    dashboard.Orders.Add(order);
                }
            }

            return Ok(dashboard);
        }


        // GET api/dashboard/vendor/{vendorId}
        [HttpGet("vendor/{vendorId}")]
        public async Task<IActionResult> GetVendorDashboard(int vendorId)
        {
            var repo = _repo; // if both DBs are accessible from same connection string
            var parameters = new Dictionary<string, object?>
            {
                { "@VendorID", vendorId }
            };

            var results = await repo.GetDataAsync("GetVendorDashboard", parameters);

            if (!results.Any())
                return NotFound("No vendor data found.");

            var vendor = new VendorDashboardModel
            {
                VendorID = vendorId,
                VendorName = results.First()["VendorName"]?.ToString(),
                VendorContactFirstName = results.First()["VendorContactFName"]?.ToString(),
                VendorContactLastName = results.First()["VendorContactLName"]?.ToString(),
                VendorPhone = results.First()["VendorPhone"]?.ToString(),
                VendorCity = results.First()["VendorCity"]?.ToString(),
                VendorState = results.First()["VendorState"]?.ToString(),
                DateUpdated = results.First()["DateUpdated"] == DBNull.Value ? null : Convert.ToDateTime(results.First()["DateUpdated"]),
                Invoices = results.Select(row => new VendorInvoiceSummary
                {
                    InvoiceID = Convert.ToInt32(row["InvoiceID"]),
                    InvoiceNumber = row["InvoiceNumber"]?.ToString(),
                    InvoiceDate = Convert.ToDateTime(row["InvoiceDate"]),
                    InvoiceTotal = Convert.ToDecimal(row["InvoiceTotal"]),
                    PaymentTotal = Convert.ToDecimal(row["PaymentTotal"]),
                    CreditTotal = Convert.ToDecimal(row["CreditTotal"]),
                    InvoiceDueDate = row["InvoiceDueDate"] == DBNull.Value ? null : Convert.ToDateTime(row["InvoiceDueDate"]),
                    PaymentDate = row["PaymentDate"] == DBNull.Value ? null : Convert.ToDateTime(row["PaymentDate"]),
                    TermsDescription = row["TermsDescription"]?.ToString()
                }).ToList()
            };

            return Ok(vendor);
        }

        // GET api/dashboard/admin
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var results = await _repo.GetDataAsync("GetEmployeeDashboard");

            if (!results.Any())
                return NotFound("No admin data available.");

            var row = results.First();

            var admin = new AdminDashboardModel
            {
                TotalCustomers = Convert.ToInt32(row["TotalCustomers"]),
                TotalVendors = Convert.ToInt32(row["TotalVendors"]),
                ActiveVendors = Convert.ToInt32(row["ActiveVendors"]),
                TotalProducts = Convert.ToInt32(row["TotalProducts"]),
                TotalSales = Convert.ToDecimal(row["TotalSales"]),
                TotalOutstandingInvoices = Convert.ToDecimal(row["TotalOutstandingInvoices"])
            };

            return Ok(admin);
        }
    }
}
