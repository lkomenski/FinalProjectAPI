using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendorController : ControllerBase
    {
        private readonly IVendorRepository _vendorRepo;

        public VendorController(IVendorRepository vendorRepo)
        {
            _vendorRepo = vendorRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vendors = await _vendorRepo.GetAllVendorsAsync();
            return Ok(vendors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var vendor = await _vendorRepo.GetVendorByIdAsync(id);
            if (vendor == null) return NotFound();
            return Ok(vendor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVendor(int id, [FromBody] Vendor vendor)
        {
            if (id != vendor.VendorID)
                return BadRequest("VendorID mismatch.");

            var rowsAffected = await _vendorRepo.UpdateVendorAsync(vendor);
            return rowsAffected > 0 ? NoContent() : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> AddVendor([FromBody] Vendor vendor)
        {
            var newId = await _vendorRepo.AddVendorAsync(vendor);
            if (newId == 0) return BadRequest("Failed to add vendor.");
            return CreatedAtAction(nameof(GetById), new { id = newId }, vendor);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            var deleted = await _vendorRepo.DeleteVendorAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

    }
}
