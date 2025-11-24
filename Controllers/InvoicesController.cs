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
        /// <response code="500">If there is a server error while retrieving invoices.</response>
        [HttpGet]
        public async Task<IActionResult> GetAllInvoices()
        {
            try
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
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve invoices.");
            }
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
        /// <response code="400">If the vendor ID is invalid.</response>
        /// <response code="500">If there is a server error while retrieving vendor invoices.</response>
        [HttpGet("vendor/{vendorId}")]
        public async Task<IActionResult> GetVendorInvoices(int vendorId)
        {
            try
            {
                if (vendorId <= 0)
                    return BadRequest("Invalid VendorID.");

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
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve vendor invoices.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/invoices/123   (single invoice detail)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves detailed information for a specific invoice.
        /// </summary>
        /// <param name="invoiceId">The ID of the invoice.</param>
        /// <returns>The invoice details including vendor information and line items.</returns>
        /// <response code="200">Returns the invoice details.</response>
        /// <response code="400">If the invoice ID is invalid.</response>
        /// <response code="404">If the invoice is not found.</response>
        /// <response code="500">If there is a server error while retrieving the invoice.</response>
        [HttpGet("{invoiceId}")]
        public async Task<IActionResult> GetInvoiceDetail(int invoiceId)
        {
            try
            {
                if (invoiceId <= 0)
                    return BadRequest("Invalid InvoiceID.");

                var parameters = new Dictionary<string, object?>
                {
                    { "@InvoiceID", invoiceId }
                };

                var dataset = await _repoAP.GetDataSetsAsync("GetInvoiceDetail", parameters);
                
                if (dataset.Count == 0 || dataset[0].Count == 0)
                    return NotFound("Invoice not found.");

                var r = dataset[0][0]; // First result set, first row (invoice header)

                // Get line items from second result set if available
                var lineItems = new List<object>();
                if (dataset.Count > 1 && dataset[1].Count > 0)
                {
                    lineItems = dataset[1].Select(item => new
                    {
                        InvoiceSequence = item.ContainsKey("InvoiceSequence") ? Convert.ToInt32(item["InvoiceSequence"]) : 0,
                        AccountNo = item.ContainsKey("AccountNo") ? Convert.ToInt32(item["AccountNo"]) : 0,
                        AccountDescription = item.ContainsKey("AccountDescription") ? item["AccountDescription"]?.ToString() : "",
                        InvoiceLineItemAmount = item.ContainsKey("InvoiceLineItemAmount") ? Convert.ToDecimal(item["InvoiceLineItemAmount"]) : 0m,
                        InvoiceLineItemDescription = item.ContainsKey("InvoiceLineItemDescription") ? item["InvoiceLineItemDescription"]?.ToString() : ""
                    }).Cast<object>().ToList();
                }

                return Ok(new
                {
                    InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                    VendorID = Convert.ToInt32(r["VendorID"]),
                    InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                    InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                    InvoiceTotal = Convert.ToDecimal(r["InvoiceTotal"]),
                    PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                    CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                    TermsID = r.ContainsKey("TermsID") && r["TermsID"] != DBNull.Value ? Convert.ToInt32(r["TermsID"]) : (int?)null,
                    TermsDescription = r.ContainsKey("TermsDescription") ? r["TermsDescription"]?.ToString() : null,
                    TermsDueDays = r.ContainsKey("TermsDueDays") && r["TermsDueDays"] != DBNull.Value ? Convert.ToInt32(r["TermsDueDays"]) : (int?)null,
                    InvoiceDueDate = r["InvoiceDueDate"] == DBNull.Value
                        ? (DateTime?)null
                        : Convert.ToDateTime(r["InvoiceDueDate"]),
                    PaymentDate = r.ContainsKey("PaymentDate") && r["PaymentDate"] != DBNull.Value
                        ? (DateTime?)Convert.ToDateTime(r["PaymentDate"])
                        : null,

                    VendorName = r["VendorName"]?.ToString(),
                    VendorContactFName = r.ContainsKey("VendorContactFName") ? r["VendorContactFName"]?.ToString() : null,
                    VendorContactLName = r.ContainsKey("VendorContactLName") ? r["VendorContactLName"]?.ToString() : null,
                    VendorAddress1 = r.ContainsKey("VendorAddress1") ? r["VendorAddress1"]?.ToString() : null,
                    VendorAddress2 = r.ContainsKey("VendorAddress2") ? r["VendorAddress2"]?.ToString() : null,
                    VendorCity = r.ContainsKey("VendorCity") ? r["VendorCity"]?.ToString() : null,
                    VendorState = r.ContainsKey("VendorState") ? r["VendorState"]?.ToString() : null,
                    VendorZipCode = r.ContainsKey("VendorZipCode") ? r["VendorZipCode"]?.ToString() : null,
                    VendorPhone = r.ContainsKey("VendorPhone") ? r["VendorPhone"]?.ToString() : null,
                    VendorEmail = r.ContainsKey("VendorEmail") ? r["VendorEmail"]?.ToString() : null,

                    LineItems = lineItems
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve invoice details.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/invoices/archived   (get all archived invoices)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all archived invoices in the system.
        /// </summary>
        /// <returns>A list of all archived invoices.</returns>
        /// <response code="200">Returns the list of all archived invoices.</response>
        /// <response code="500">If there is a server error while retrieving archived invoices.</response>
        [HttpGet("archived")]
        public async Task<IActionResult> GetArchivedInvoices()
        {
            try
            {
                var results = await _repoAP.GetDataAsync("GetArchivedInvoices", new Dictionary<string, object?>());

                return Ok(results.Select(r => new
                {
                    InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                    VendorID = r["VendorID"] != DBNull.Value ? Convert.ToInt32(r["VendorID"]) : (int?)null,
                    VendorName = r["VendorName"]?.ToString(),
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
                    PaymentDate = r["PaymentDate"] == DBNull.Value
                        ? (DateTime?)null
                        : Convert.ToDateTime(r["PaymentDate"]),
                    IsPaid = (Convert.ToDecimal(r["InvoiceTotal"]) - 
                             Convert.ToDecimal(r["PaymentTotal"]) - 
                             Convert.ToDecimal(r["CreditTotal"])) <= 0,
                    TermsDescription = r["TermsDescription"]?.ToString()
                }));
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve archived invoices.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/invoices/archived/123   (single archived invoice detail)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves detailed information for a specific archived invoice.
        /// </summary>
        /// <param name="invoiceId">The ID of the archived invoice.</param>
        /// <returns>The archived invoice details including vendor information.</returns>
        /// <response code="200">Returns the archived invoice details.</response>
        /// <response code="400">If the invoice ID is invalid.</response>
        /// <response code="404">If the archived invoice is not found.</response>
        /// <response code="500">If there is a server error while retrieving the archived invoice.</response>
        [HttpGet("archived/{invoiceId}")]
        public async Task<IActionResult> GetArchivedInvoiceDetail(int invoiceId)
        {
            try
            {
                if (invoiceId <= 0)
                    return BadRequest("Invalid InvoiceID.");

                var parameters = new Dictionary<string, object?>
                {
                    { "@InvoiceID", invoiceId }
                };

                var rows = await _repoAP.GetDataAsync("GetArchivedInvoiceDetail", parameters);
                var r = rows.FirstOrDefault();

                if (r == null)
                    return NotFound("Archived invoice not found.");

                return Ok(new
                {
                    InvoiceID = Convert.ToInt32(r["InvoiceID"]),
                    VendorID = Convert.ToInt32(r["VendorID"]),
                    InvoiceNumber = r["InvoiceNumber"]?.ToString(),
                    InvoiceDate = Convert.ToDateTime(r["InvoiceDate"]),
                    InvoiceTotal = Convert.ToDecimal(r["InvoiceTotal"]),
                    PaymentTotal = Convert.ToDecimal(r["PaymentTotal"]),
                    CreditTotal = Convert.ToDecimal(r["CreditTotal"]),
                    TermsID = r["TermsID"] != DBNull.Value ? Convert.ToInt32(r["TermsID"]) : (int?)null,
                    TermsDescription = r["TermsDescription"]?.ToString(),
                    TermsDueDays = r["TermsDueDays"] != DBNull.Value ? Convert.ToInt32(r["TermsDueDays"]) : (int?)null,
                    InvoiceDueDate = r["InvoiceDueDate"] == DBNull.Value
                        ? (DateTime?)null
                        : Convert.ToDateTime(r["InvoiceDueDate"]),
                    PaymentDate = r["PaymentDate"] == DBNull.Value
                        ? (DateTime?)null
                        : Convert.ToDateTime(r["PaymentDate"]),

                    VendorName = r["VendorName"]?.ToString(),
                    VendorContactFName = r["VendorContactFName"]?.ToString(),
                    VendorContactLName = r["VendorContactLName"]?.ToString(),
                    VendorAddress1 = r["VendorAddress1"]?.ToString(),
                    VendorAddress2 = r["VendorAddress2"]?.ToString(),
                    VendorCity = r["VendorCity"]?.ToString(),
                    VendorState = r["VendorState"]?.ToString(),
                    VendorZipCode = r["VendorZipCode"]?.ToString(),
                    VendorPhone = r["VendorPhone"]?.ToString(),
                    VendorEmail = r["VendorEmail"]?.ToString()
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve archived invoice details.");
            }
        }
    }
}
