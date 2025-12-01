using FinalProjectAPI.Models;
using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for managing vendor information and operations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class VendorsController : ControllerBase
    {
        private readonly IDataRepository _repo;

        /// <summary>
        /// Initializes a new instance of the VendorsController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public VendorsController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("AP"); // use AP database for vendors
        }

        // ---------------------------------------------------------
        // GET: api/vendors   (get all vendors)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all vendors from the AP database.
        /// </summary>
        /// <returns>A list of all vendors.</returns>
        /// <response code="200">Returns the list of all vendors.</response>
        /// <response code="500">If there is a server error while retrieving vendors.</response>
        [HttpGet]
        public async Task<IActionResult> GetAllVendors()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetAllVendors");
                var vendors = rows.Select(MapRowToVendor).ToList();
                return Ok(vendors);
            }
            catch (Exception)
            {
                return StatusCode(500, $"Internal server error: Failed to retrieve vendors.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/vendors/{id}   (get vendor by ID)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves a specific vendor by their ID.
        /// </summary>
        /// <param name="id">The ID of the vendor to retrieve.</param>
        /// <returns>The vendor with the specified ID.</returns>
        /// <response code="200">Returns the requested vendor.</response>
        /// <response code="400">If the vendor ID is invalid.</response>
        /// <response code="404">If the vendor is not found.</response>
        /// <response code="500">If there is a server error while retrieving the vendor.</response>
        [HttpGet("{id}", Name = "GetVendorById")]
        public async Task<IActionResult> GetVendorById(int id)
        {
            try
            {
                if (id <= 0) // edit this later based on valid VendorID criteria
                {
                    return BadRequest("Invalid VendorID.");
                }

                var rows = await _repo.GetDataAsync("GetVendorById", new Dictionary<string, object?>
                {
                    { "@VendorID", id }
                });

                var vendor = rows.Select(MapRowToVendor).FirstOrDefault();
                if (vendor == null)
                {
                    return NotFound($"Vendor with ID {id} not found.");
                }

                return Ok(vendor);
            }
            catch (Exception)
            {
                return StatusCode(500, $"Internal server error: Failed to retrieve vendor.");
            }
        }

        // ---------------------------------------------------------
        // POST: api/vendors/add   (add new vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Adds a new vendor to the system.
        /// </summary>
        /// <param name="vendor">The vendor information to add.</param>
        /// <returns>The newly created vendor.</returns>
        /// <response code="200">Returns the newly created vendor.</response>
        /// <response code="400">If the vendor data is null.</response>
        /// <response code="500">If there is a server error while adding the vendor.</response>
        [HttpPost("add")]
        public async Task<IActionResult> AddVendor([FromBody] Vendor vendor)
        {
            try
            {
                if (vendor == null)
                {
                    return BadRequest("Vendor object is null.");
                }

                var rows = await _repo.GetDataAsync("AddVendor", new Dictionary<string, object?>
                {
                    { "@VendorName", vendor.VendorName },
                    { "@VendorAddress1", vendor.VendorAddress1 },
                    { "@VendorAddress2", vendor.VendorAddress2 },
                    { "@VendorCity", vendor.VendorCity },
                    { "@VendorState", vendor.VendorState },
                    { "@VendorZipCode", vendor.VendorZipCode },
                    { "@VendorPhone", vendor.VendorPhone },
                    { "@VendorContactLName", vendor.VendorContactLName },
                    { "@VendorContactFName", vendor.VendorContactFName },
                    { "@DefaultTermsID", vendor.DefaultTermsID },
                    { "@DefaultAccountNo", vendor.DefaultAccountNo },
                    { "@IsActive", vendor.IsActive }
                });

                var newVendor = rows.Select(MapRowToVendor).FirstOrDefault();
                return Ok(newVendor);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to add vendor.");
            }
        }
        

        // ---------------------------------------------------------
        // DELETE: api/vendors/{id}   (delete vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Deletes a vendor from the system.
        /// </summary>
        /// <param name="id">The ID of the vendor to delete.</param>
        /// <returns>Confirmation of the deletion.</returns>
        /// <response code="200">Returns confirmation of successful deletion.</response>
        /// <response code="400">If the vendor ID is invalid.</response>
        /// <response code="500">If there is a server error while deleting the vendor.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendorById(int id)
        {
            try
            {
                if (id <= 0) 
                {
                    return BadRequest("Invalid VendorID.");
                }

                var parameters = new Dictionary<string, object?>
                {
                    { "@VendorID", id },
                    { "@Delete", 0 }  // 0 = deactivate, 1 = permanently delete
                };

                var rows = await _repo.GetDataAsync("DeleteVendorById", parameters);
                var result = rows.FirstOrDefault();
                
                if (result != null)
                {
                    var status = result["Status"]?.ToString();
                    var message = result["Message"]?.ToString();
                    
                    if (status == "Error")
                    {
                        return StatusCode(500, message ?? "Failed to delete vendor.");
                    }
                    
                    return Ok(new
                    {
                        Status = status,
                        Message = message,
                        VendorID = id
                    });
                }
                
                return Ok($"Vendor {id} deleted successfully.");
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to delete vendor.");
            }
        }

        // ---------------------------------------------------------
        // PUT: api/vendors/update   (update vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Updates an existing vendor's information.
        /// </summary>
        /// <param name="vendor">The updated vendor information.</param>
        /// <returns>The updated vendor.</returns>
        /// <response code="200">Returns the updated vendor.</response>
        /// <response code="400">If the vendor data is null.</response>
        /// <response code="500">If there is a server error while updating the vendor.</response>
        [HttpPut("update")]
        public async Task<IActionResult> UpdateVendor([FromBody] Vendor vendor)
        {
            try
            {
                if (vendor == null)
                {
                    return BadRequest("Vendor object is null.");
                }

                if (vendor.VendorID <= 0)
                {
                    return BadRequest("Invalid VendorID.");
                }
                
                // Stored procedure will handle filling in missing data from existing record
                var parameters = new Dictionary<string, object?>
                {
                    { "@VendorID", vendor.VendorID },
                    { "@VendorName", vendor.VendorName ?? string.Empty },
                    { "@VendorAddress1", vendor.VendorAddress1 ?? string.Empty },
                    { "@VendorAddress2", vendor.VendorAddress2 ?? string.Empty },
                    { "@VendorCity", vendor.VendorCity ?? string.Empty },
                    { "@VendorState", vendor.VendorState ?? string.Empty },
                    { "@VendorZipCode", vendor.VendorZipCode ?? string.Empty },
                    { "@VendorPhone", vendor.VendorPhone ?? string.Empty },
                    { "@VendorContactLName", vendor.VendorContactLName ?? string.Empty },
                    { "@VendorContactFName", vendor.VendorContactFName ?? string.Empty },
                    { "@DefaultTermsID", vendor.DefaultTermsID > 0 ? vendor.DefaultTermsID : 0 },
                    { "@DefaultAccountNo", vendor.DefaultAccountNo > 0 ? vendor.DefaultAccountNo : 0 },
                    { "@IsActive", vendor.IsActive }
                };

                var rows = await _repo.GetDataAsync("UpdateVendor", parameters);
                var updatedVendor = rows.Select(MapRowToVendor).FirstOrDefault();
                return Ok(updatedVendor);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to update vendor.");
            }
        }

        // ---------------------------------------------------------
        // PUT: api/vendors/deactivate/{vendorId}   (deactivate vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Deactivates a vendor account without deleting it.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor to deactivate.</param>
        /// <returns>The deactivated vendor.</returns>
        /// <response code="200">Returns the deactivated vendor.</response>
        /// <response code="400">If the vendor ID is invalid.</response>
        /// <response code="500">If there is a server error while deactivating the vendor.</response>
        [HttpPut("deactivate/{vendorId}")]
        public async Task<IActionResult> DeactivateVendor(int vendorId)
        {
            try
            {
                if (vendorId <= 0)
                    return BadRequest("Invalid VendorID.");

                var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
                var rows = await _repo.GetDataAsync("DeactivateVendor", parameters);
                var vendor = rows.Select(MapRowToVendor).FirstOrDefault();
                return Ok(vendor);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to deactivate vendor.");
            }
        }
        
        // ---------------------------------------------------------
        // PUT: api/vendors/activate/{vendorId}   (activate vendor)
        // ---------------------------------------------------------
        /// <summary>
        /// Activates a previously deactivated vendor account.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor to activate.</param>
        /// <returns>The activated vendor.</returns>
        /// <response code="200">Returns the activated vendor.</response>
        /// <response code="400">If the vendor ID is invalid.</response>
        /// <response code="500">If there is a server error while activating the vendor.</response>
        [HttpPut("activate/{vendorId}")]
        public async Task<IActionResult> ActivateVendor(int vendorId)
        {
            try
            {
                if (vendorId <= 0)
                    return BadRequest("Invalid VendorID.");

                var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
                var rows = await _repo.GetDataAsync("ActivateVendor", parameters);
                var vendor = rows.Select(MapRowToVendor).FirstOrDefault();
                return Ok(vendor);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to activate vendor.");
            }
        }

        // ---------------------------------------------------------
        // POST: api/vendors/generate-token/{vendorId}   (generate vendor registration token)
        // ---------------------------------------------------------
        /// <summary>
        /// Generates a registration token for a vendor to create their login account.
        /// Token expires in 48 hours and invalidates any previous tokens.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor.</param>
        /// <returns>The registration token, expiration info, and vendor information.</returns>
        /// <response code="200">Returns the registration token with expiration details.</response>
        /// <response code="400">If the vendor not found or already has an account.</response>
        [HttpPost("generate-token/{vendorId}")]
        public async Task<IActionResult> GenerateVendorToken(int vendorId)
        {
            var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
            var results = await _repo.GetDataAsync("GenerateVendorRegistrationToken", parameters);
            var row = results.FirstOrDefault();

            if (row == null)
                return StatusCode(500, "Failed to generate token.");

            string status = row["Status"]?.ToString() ?? "";
            if (status == "Error")
            {
                return BadRequest(row["Message"]?.ToString() ?? "Failed to generate token.");
            }

            return Ok(new
            {
                RegistrationToken = row.ContainsKey("RegistrationToken") ? row["RegistrationToken"]?.ToString() : null,
                TokenExpiry = row.ContainsKey("TokenExpiry") ? row["TokenExpiry"] : null,
                HoursUntilExpiry = row.ContainsKey("HoursUntilExpiry") ? row["HoursUntilExpiry"] : null,
                VendorID = row.ContainsKey("VendorID") ? row["VendorID"] : vendorId,
                VendorName = row.ContainsKey("VendorName") ? row["VendorName"]?.ToString() : null,
                FirstName = row.ContainsKey("FirstName") ? row["FirstName"]?.ToString() : null,
                LastName = row.ContainsKey("LastName") ? row["LastName"]?.ToString() : null,
                VendorEmail = row.ContainsKey("VendorEmail") ? row["VendorEmail"]?.ToString() : null,
                Status = status,
                Message = status == "Warning" ? row["Message"]?.ToString() : "Token generated successfully"
            });
        }

        /// <summary>
        /// Maps a database row to a Vendor object with safe type conversion and null handling.
        /// </summary>
        /// <param name="row">The database row containing vendor data.</param>
        /// <returns>A Vendor object populated with the row data, using default values for missing or null fields.</returns>
        public static Vendor MapRowToVendor(IDictionary<string, object?> row)
        {
            return new Vendor
            {
                VendorID = row.ContainsKey("VendorID") && row["VendorID"] != DBNull.Value ? Convert.ToInt32(row["VendorID"]) : 0,
                VendorName = row.ContainsKey("VendorName") ? row["VendorName"]?.ToString() ?? string.Empty : string.Empty,
                VendorAddress1 = row.ContainsKey("VendorAddress1") ? row["VendorAddress1"]?.ToString() ?? string.Empty : string.Empty,
                VendorAddress2 = row.ContainsKey("VendorAddress2") ? row["VendorAddress2"]?.ToString() : null,
                VendorCity = row.ContainsKey("VendorCity") ? row["VendorCity"]?.ToString() ?? string.Empty : string.Empty,
                VendorState = row.ContainsKey("VendorState") ? row["VendorState"]?.ToString() ?? string.Empty : string.Empty,
                VendorZipCode = row.ContainsKey("VendorZipCode") ? row["VendorZipCode"]?.ToString() ?? string.Empty : string.Empty,
                VendorPhone = row.ContainsKey("VendorPhone") ? row["VendorPhone"]?.ToString() ?? string.Empty : string.Empty,
                VendorContactLName = row.ContainsKey("VendorContactLName") ? row["VendorContactLName"]?.ToString() ?? string.Empty : string.Empty,
                VendorContactFName = row.ContainsKey("VendorContactFName") ? row["VendorContactFName"]?.ToString() ?? string.Empty : string.Empty,
                DefaultTermsID = row.ContainsKey("DefaultTermsID") && row["DefaultTermsID"] != DBNull.Value ? Convert.ToInt32(row["DefaultTermsID"]) : 0,
                DefaultAccountNo = row.ContainsKey("DefaultAccountNo") && row["DefaultAccountNo"] != DBNull.Value ? Convert.ToInt32(row["DefaultAccountNo"]) : 0,
                IsActive = row.ContainsKey("IsActive") && row["IsActive"] != DBNull.Value ? Convert.ToBoolean(row["IsActive"]) : true
            };
        }

        // ---------------------------------------------------------
        // GET: api/vendors/terms   (get payment terms)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all payment terms for vendor selection.
        /// </summary>
        /// <returns>A list of all payment terms.</returns>
        /// <response code="200">Returns the list of all payment terms.</response>
        /// <response code="500">If there is a server error while retrieving terms.</response>
        [HttpGet("terms")]
        public async Task<IActionResult> GetAllTerms()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetAllTerms");
                
                var terms = rows.Select(row => new
                {
                    TermsID = row.ContainsKey("TermsID") && row["TermsID"] != DBNull.Value ? Convert.ToInt32(row["TermsID"]) : 0,
                    TermsDescription = row.ContainsKey("TermsDescription") ? row["TermsDescription"]?.ToString() ?? string.Empty : string.Empty,
                    TermsDueDays = row.ContainsKey("TermsDueDays") && row["TermsDueDays"] != DBNull.Value ? Convert.ToInt32(row["TermsDueDays"]) : 0
                }).ToList();

                return Ok(terms);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve payment terms.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/vendors/accounts   (get GL accounts)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all GL accounts for vendor selection.
        /// </summary>
        /// <returns>A list of all GL accounts.</returns>
        /// <response code="200">Returns the list of all GL accounts.</response>
        /// <response code="500">If there is a server error while retrieving GL accounts.</response>
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAllGLAccounts()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetAllGLAccounts");
                
                var accounts = rows.Select(row => new
                {
                    AccountNo = row.ContainsKey("AccountNo") && row["AccountNo"] != DBNull.Value ? Convert.ToInt32(row["AccountNo"]) : 0,
                    AccountDescription = row.ContainsKey("AccountDescription") ? row["AccountDescription"]?.ToString() ?? string.Empty : string.Empty
                }).ToList();

                return Ok(accounts);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve GL accounts.");
            }
        }
    }
}
