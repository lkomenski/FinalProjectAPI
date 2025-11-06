using FinalProjectAPI.Models;

namespace FinalProjectAPI.Infrastructure.Interfaces
{
    public interface IVendorRepository
    {
        Task<IEnumerable<Vendor>> GetAllVendorsAsync();
        Task<Vendor?> GetVendorByIdAsync(int vendorId);
        Task<int> UpdateVendorAsync(Vendor vendor);
        Task<int> AddVendorAsync(Vendor vendor);
        Task<bool> DeleteVendorAsync(int vendorId);
    }
}
