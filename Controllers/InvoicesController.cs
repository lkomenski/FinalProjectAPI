using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for managing vendor invoices.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly IDataRepository _repoAP;

        /// <summary>
        /// Initializes a new instance of the InvoicesController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public InvoicesController(IDataRepositoryFactory factory)
        {
            _repoAP = factory.Create("AP");
        }

        // ---------------------------------------------------------
        // GET: api/invoices   (get all invoices)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all invoices in the system.
        /// </summary>
        /// <returns>A list of all invoices.</returns>
        /// <response code="200">Returns the list of all invoices.</response>
        [HttpGet]
        public async Task<IActionResult> GetAllInvoices()
        {
            var results = await _repoAP.GetDataAsync("GetAllInvoices", new Dictionary<string, object?>());

            return Ok(results.Select(r => new
            {
                InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                VendorID = r["VendorID"] != DBNull.Value ? Convert.ToInt32(r["VendorID"]) : (int?)null,
                VendorName = r["VendorName"]?.ToString(),
                CustomerName = r.ContainsKey("CustomerName") ? r["CustomerName"]?.ToString() : null,
                InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                TotalAmount = Convert.ToDecimal(r["InvoiceTotal"]),
                PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                AmountDue = Convert.ToDecimal(r["InvoiceTotal"]) - 
                            Convert.ToDecimal(r["PaymentTotal"]) - 
                            Convert.ToDecimal(r["CreditTotal"]),
                DueDate = r["InvoiceDueDate"] == DBNull.Value
                    ? (DateTime?)null
                    : Convert.ToDateTime(r["InvoiceDueDate"]),
                IsPaid = (Convert.ToDecimal(r["InvoiceTotal"]) - 
                         Convert.ToDecimal(r["PaymentTotal"]) - 
                         Convert.ToDecimal(r["CreditTotal"])) <= 0
            }));
        }

        // ---------------------------------------------------------
        // GET: api/invoices/vendor/122   (get all invoices for vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all invoices for a specific vendor.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor.</param>
        /// <returns>A list of invoices for the vendor.</returns>
        /// <response code="200">Returns the list of vendor invoices.</response>
        [HttpGet("vendor/{vendorId}")]
        public async Task<IActionResult> GetVendorInvoices(int vendorId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@VendorID", vendorId }
            };

            var results = await _repoAP.GetDataAsync("GetVendorInvoices", parameters);

            return Ok(results.Select(r => new
            {
                InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                InvoiceTotal = Convert.ToDecimal(r["InvoiceTotal"]),
                PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                InvoiceDueDate = r["InvoiceDueDate"] == DBNull.Value
                    ? (DateTime?)null
                    : Convert.ToDateTime(r["InvoiceDueDate"]),
                PaymentDate = r["PaymentDate"] == DBNull.Value
                    ? (DateTime?)null
                    : Convert.ToDateTime(r["PaymentDate"]),
                TermsDescription = r["TermsDescription"]?.ToString()
            }));
        }

        // ---------------------------------------------------------
        // GET: api/invoices/123   (single invoice detail)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves detailed information for a specific invoice.
        /// </summary>
        /// <param name="invoiceId">The ID of the invoice.</param>
        /// <returns>The invoice details including vendor information.</returns>
        /// <response code="200">Returns the invoice details.</response>
        /// <response code="404">If the invoice is not found.</response>
        [HttpGet("{invoiceId}")]
        public async Task<IActionResult> GetInvoiceDetail(int invoiceId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@InvoiceID", invoiceId }
            };

            var rows = await _repoAP.GetDataAsync("GetInvoiceDetail", parameters);
            var r = rows.FirstOrDefault();

            if (r == null)
                return NotFound("Invoice not found.");

            return Ok(new
            {
                InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                VendorID = Convert.ToInt32(r["VendorID"]),
                InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                InvoiceTotal = Convert.ToDecimal(r["InvoiceTotal"]),
                PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                InvoiceDueDate = r["InvoiceDueDate"] == DBNull.Value
                    ? (DateTime?)null
                    : Convert.ToDateTime(r["InvoiceDueDate"]),
                PaymentDate = r["PaymentDate"] == DBNull.Value
                    ? (DateTime?)null
                    : Convert.ToDateTime(r["PaymentDate"]),
                TermsDescription = r["TermsDescription"]?.ToString(),

                VendorName = r["VendorName"]?.ToString(),
                VendorContactFName = r["VendorContactFName"]?.ToString(),
                VendorContactLName = r["VendorContactLName"]?.ToString(),
                VendorCity = r["VendorCity"]?.ToString(),
                VendorState = r["VendorState"]?.ToString(),
                VendorPhone = r["VendorPhone"]?.ToString()
            });
        }
    }
}
