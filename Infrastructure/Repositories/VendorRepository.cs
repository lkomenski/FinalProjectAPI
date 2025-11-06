using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Repositories;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Infrastructure.Repositories
{
    public class VendorRepository : IVendorRepository
    {
        private readonly SqlDataRepository _sqlData;

        public VendorRepository(SqlDataRepository sqlData)
        {
            _sqlData = sqlData;
        }

        public async Task<IEnumerable<Vendor>> GetAllVendorsAsync()
        {
            var results = await _sqlData.GetDataAsync("GetAllVendors");
            return results.Select(row => MapVendor(row));
        }

        public async Task<Vendor?> GetVendorByIdAsync(int vendorId)
        {
            var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
            var results = await _sqlData.GetDataAsync("GetVendorById", parameters);
            var row = results.FirstOrDefault();
            return row == null ? null : MapVendor(row);
        }

        public async Task<int> UpdateVendorAsync(Vendor vendor)
        {
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

            return await _sqlData.ExecuteNonQueryAsync("UpdateVendor", parameters);
        }

        private static Vendor MapVendor(IDictionary<string, object?> row)
        {
            return new Vendor
            {
                VendorID = Convert.ToInt32(row["VendorID"]),
                VendorName = row["VendorName"]?.ToString() ?? "",
                VendorAddress1 = row["VendorAddress1"]?.ToString() ?? "",
                VendorAddress2 = row["VendorAddress2"]?.ToString(),
                VendorCity = row["VendorCity"]?.ToString() ?? "",
                VendorState = row["VendorState"]?.ToString() ?? "",
                VendorZipCode = row["VendorZipCode"]?.ToString() ?? "",
                VendorPhone = row["VendorPhone"]?.ToString() ?? "",
                VendorContactLName = row["VendorContactLName"]?.ToString() ?? "",
                VendorContactFName = row["VendorContactFName"]?.ToString() ?? "",
                DefaultTermsID = Convert.ToInt32(row["DefaultTermsID"]),
                DefaultAccountNo = Convert.ToInt32(row["DefaultAccountNo"])
            };
        }

        public async Task<int> AddVendorAsync(Vendor vendor)
        {
            var parameters = new Dictionary<string, object?>
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
            };
            var results = await _sqlData.GetDataAsync("AddVendor", parameters);
            var row = results.FirstOrDefault();
            return row == null ? 0 : Convert.ToInt32(row["NewVendorID"]);
        }

        public async Task<bool> DeleteVendorAsync(int vendorId)
        {
            var parameters = new Dictionary<string, object?> { { "@VendorID", vendorId } };
            var results = await _sqlData.GetDataAsync("DeleteVendor", parameters);
            var row = results.FirstOrDefault();
            return row != null && Convert.ToInt32(row["RowsDeleted"]) > 0;
        }
    }
}
