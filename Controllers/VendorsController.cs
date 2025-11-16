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

                return Ok(rows);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to add vendor.");
            }
        }
        

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
                if (id <= 0) // edit this later based on valid VendorID criteria
                {
                    return BadRequest("Invalid VendorID.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to delete vendor.");
            }
            var parameters = new Dictionary<string, object?>
            {
                { "@VendorID", id }
            };

            var result = await _repo.GetDataAsync("DeleteVendorById", parameters);
            return Ok(result);
        }

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
                if (vendor == null) // edit this later based on valid Vendor criteria
                {
                    return BadRequest("Vendor object is null.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to update vendor.");
            }
            var parameters = new Dictionary<string, object?>
            {
                { "@VendorID", vendor.VendorID },
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
            };

            var result = await _repo.GetDataAsync("UpdateVendor", parameters);
            return Ok(result);
        }

        /// <summary>
        /// Deactivates a vendor account without deleting it.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor to deactivate.</param>
        /// <returns>The deactivated vendor.</returns>
        /// <response code="200">Returns the deactivated vendor.</response>
        [HttpPut("deactivate/{vendorId}")]
        public async Task<IActionResult> DeactivateVendor(int vendorId)
        {
            var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
            var results = await _repo.GetDataAsync("DeactivateVendor", parameters);
            return Ok(results.FirstOrDefault());
        }
        
        /// <summary>
        /// Activates a previously deactivated vendor account.
        /// </summary>
        /// <param name="vendorId">The ID of the vendor to activate.</param>
        /// <returns>The activated vendor.</returns>
        /// <response code="200">Returns the activated vendor.</response>
        [HttpPut("activate/{vendorId}")]
        public async Task<IActionResult> ActivateVendor(int vendorId)
        {
            var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
            var results = await _repo.GetDataAsync("ActivateVendor", parameters);
            return Ok(results.FirstOrDefault());
        }

        /// <summary>
        /// Maps a database row to a Vendor object.
        /// </summary>
        /// <param name="row">The database row containing vendor data.</param>
        /// <returns>A Vendor object populated with the row data.</returns>
        public static Vendor MapRowToVendor(IDictionary<string, object?> row)
        {
            return new Vendor
            {
                VendorID = Convert.ToInt32(row["VendorID"]),
                VendorName = row["VendorName"]?.ToString() ?? string.Empty,
                VendorAddress1 = row["VendorAddress1"]?.ToString() ?? string.Empty,
                VendorAddress2 = row["VendorAddress2"]?.ToString(),
                VendorCity = row["VendorCity"]?.ToString() ?? string.Empty,
                VendorState = row["VendorState"]?.ToString() ?? string.Empty,
                VendorZipCode = row["VendorZipCode"]?.ToString() ?? string.Empty,
                VendorPhone = row["VendorPhone"]?.ToString() ?? string.Empty,
                VendorContactLName = row["VendorContactLName"]?.ToString() ?? string.Empty,
                VendorContactFName = row["VendorContactFName"]?.ToString() ?? string.Empty,
                DefaultTermsID = Convert.ToInt32(row["DefaultTermsID"]),
                DefaultAccountNo = Convert.ToInt32(row["DefaultAccountNo"]),
                IsActive = Convert.ToBoolean(row["IsActive"])

            };
        }
    }
}
