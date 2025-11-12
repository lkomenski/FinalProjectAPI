using FinalProjectAPI.Models;
using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendorController : ControllerBase
    {
        private readonly IDataRepository _repo;

        public VendorController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("AP"); // use AP database for vendors
        }

        // HTTP GET to retrieve all vendors
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

        // HTTP GET to retrieve vendor by ID
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

        // HTTP POST to add new vendor
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
                    { "@DefaultAccountNo", vendor.DefaultAccountNo }
                });

                return Ok(rows);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to add vendor.");
            }
        }
        

        // HTTP DELETE to remove vendor by ID
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

        // HTTP PUT to update existing vendor
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
                { "@DefaultAccountNo", vendor.DefaultAccountNo }
            };

            var result = await _repo.GetDataAsync("UpdateVendor", parameters);
            return Ok(result);
        }

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
                DefaultAccountNo = Convert.ToInt32(row["DefaultAccountNo"])
            };
        }
    }
}
