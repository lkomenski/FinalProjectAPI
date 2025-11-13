using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IDataRepository _repo;

        public ProductsController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("MyGuitarShop");
        }

        // HTTP GET to retrieve all products
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetAllProducts");
                var products = rows.Select(MapRowToProduct).ToList();
                return Ok(products);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve products.");
            }
        }

        // HTTP GET to retrieve product by ID
        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductById(int productId)
        {
            try
            {
                if (productId <= 0) {
                    return BadRequest("Invalid ProductID.");
                }
                var parameters = new Dictionary<string, object?>{
                    {"@ProductID", productId}
                };
                
                var result = await _repo.GetDataAsync("GetProductById", parameters);
                return Ok(result.FirstOrDefault());
            } catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve product.");
            }
        }

        // HTTP POST to add new product
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] Product product)
        {
            if (product == null)
                return BadRequest("Product data is required.");

            var parameters = new Dictionary<string, object?>
            {
                {"@CategoryID", product.CategoryID},
                {"@ProductCode", product.ProductCode},
                {"@ProductName", product.ProductName},
                {"@Description", product.Description},
                {"@ListPrice", product.ListPrice},
                {"@DiscountPercent", product.DiscountPercent}
            };

            var result = await _repo.GetDataAsync("AddProduct", parameters);
            return Ok(result.FirstOrDefault());
        }

        // HTTP PUT to update existing product
        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateProduct(int productId, [FromBody] Product product)
        {
            if (product == null)
                return BadRequest("Product data is required.");

            product.ProductID = productId;

            var parameters = new Dictionary<string, object?>
            {
                {"@ProductID", product.ProductID},
                {"@CategoryID", product.CategoryID},
                {"@ProductCode", product.ProductCode},
                {"@ProductName", product.ProductName},
                {"@Description", product.Description},
                {"@ListPrice", product.ListPrice},
                {"@DiscountPercent", product.DiscountPercent}
            };

            var result = await _repo.GetDataAsync("UpdateProduct", parameters);
            return Ok(result.FirstOrDefault());
        }

        // HTTP DELETE to remove product by ID
        [HttpDelete("{productId}")]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            try
            {
                if (productId <= 0) //
                {
                    return BadRequest("Invalid ProductID.");
                }
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to delete product.");
            }
            var parameters = new Dictionary<string, object?>
            {
                {"@ProductID", productId}
            };

            await _repo.GetDataAsync("DeleteProduct", parameters);
            return Ok($"Product {productId} deleted successfully.");
        }

        // HTTP PUT to activate product by ID
        [HttpPut("activate/{productId}")]
        public async Task<IActionResult> ActivateProduct(int productId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@ProductID", productId }
            };

            var results = await _repo.GetDataAsync("ActivateProduct", parameters);
            return Ok(results.FirstOrDefault());
        }

        // HTTP PUT to deactivate product by ID
        [HttpPut("deactivate/{productId}")]
        public async Task<IActionResult> DeactivateProduct(int productId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@ProductID", productId }
            };

            var results = await _repo.GetDataAsync("DeactivateProduct", parameters);
            return Ok(results.FirstOrDefault());
        }

        // GET: api/products/featured
        [HttpGet("featured")]
        public async Task<IActionResult> GetFeaturedProducts()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetFeaturedProducts");
                return Ok(rows);
            }
            catch (Exception)
            {
                return StatusCode(500, "Failed to load featured products.");
            }
        }

        // GET: api/products/best-sellers
        [HttpGet("best-sellers")]
        public async Task<IActionResult> GetBestSellers()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetBestSellers");
                return Ok(rows);
            }
            catch (Exception)
            {
                return StatusCode(500, "Failed to load best sellers.");
            }
}

        // Helper method to map data row to Product object
        public static Product MapRowToProduct(IDictionary<string, object?> row)
        {
            return new Product
            {
                ProductID = Convert.ToInt32(row["ProductID"]),
                CategoryID = Convert.ToInt32(row["CategoryID"]),
                ProductCode = row["ProductCode"]?.ToString() ?? "",
                ProductName = row["ProductName"]?.ToString() ?? "",
                Description = row["Description"]?.ToString() ?? "",
                ListPrice = row["ListPrice"] == DBNull.Value
                    ? 0
                    : Convert.ToDecimal(row["ListPrice"]),
                DiscountPercent = row["DiscountPercent"] == DBNull.Value
                    ? 0
                    : Convert.ToDecimal(row["DiscountPercent"]),
                DateUpdated = row["DateUpdated"] == DBNull.Value 
                    ? null 
                    : Convert.ToDateTime(row["DateUpdated"])
            };
        }

    }
}
