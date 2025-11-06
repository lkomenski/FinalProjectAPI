using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Repositories;
using FinalProjectAPI.Infrastructure.Interfaces;
using System.Data;

namespace FinalProjectAPI.Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly SqlDataRepository _sqlData;
        public ProductRepository(SqlDataRepository sqlData) => _sqlData = sqlData;

        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            var results = await _sqlData.GetDataAsync("GetAllProducts");
            return results.Select(row => new Product
            {
                ProductID = Convert.ToInt32(row["ProductID"]),
                ProductName = row["ProductName"]?.ToString() ?? "",
                ProductCode = row["ProductCode"]?.ToString() ?? "",
                CategoryName = row["CategoryName"]?.ToString() ?? "",
                ListPrice = Convert.ToDecimal(row["ListPrice"]),
                DiscountPercent = Convert.ToDecimal(row["DiscountPercent"])
            });
        }

        public async Task<Product?> GetProductByIdAsync(int productId)
        {
            var parameters = new Dictionary<string, object?> { { "@ProductID", productId } };
            var results = await _sqlData.GetDataAsync("GetProductById", parameters);
            var row = results.FirstOrDefault();
            if (row == null) return null;

            return new Product
            {
                ProductID = Convert.ToInt32(row["ProductID"]),
                ProductName = row["ProductName"]?.ToString() ?? "",
                ProductCode = row["ProductCode"]?.ToString() ?? "",
                Description = row["Description"]?.ToString() ?? "",
                CategoryID = Convert.ToInt32(row["CategoryID"]),
                ListPrice = Convert.ToDecimal(row["ListPrice"]),
                DiscountPercent = Convert.ToDecimal(row["DiscountPercent"]),
                CategoryName = row["CategoryName"]?.ToString()
            };
        }

        public async Task<int> AddProductAsync(Product product)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@CategoryID", product.CategoryID },
                { "@ProductCode", product.ProductCode },
                { "@ProductName", product.ProductName },
                { "@Description", product.Description },
                { "@ListPrice", product.ListPrice },
                { "@DiscountPercent", product.DiscountPercent }
            };

            var results = await _sqlData.GetDataAsync("AddProduct", parameters);
            var row = results.FirstOrDefault();
            return row == null ? 0 : Convert.ToInt32(row["NewProductID"]);
        }

        public async Task<int> UpdateProductAsync(Product product)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@ProductID", product.ProductID },
                { "@CategoryID", product.CategoryID },
                { "@ProductCode", product.ProductCode },
                { "@ProductName", product.ProductName },
                { "@Description", product.Description },
                { "@ListPrice", product.ListPrice },
                { "@DiscountPercent", product.DiscountPercent }
            };

            return await _sqlData.ExecuteNonQueryAsync("UpdateProduct", parameters);
        }

        public async Task<bool> DeleteProductAsync(int productId)
        {
            var parameters = new Dictionary<string, object?> { { "@ProductID", productId } };
            var results = await _sqlData.GetDataAsync("DeleteProduct", parameters);
            var row = results.FirstOrDefault();
            return row != null && Convert.ToInt32(row["RowsDeleted"]) > 0;
        }
    }
}
