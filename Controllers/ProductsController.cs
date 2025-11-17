using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for managing products in the guitar shop inventory.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IDataRepository _repo;

        /// <summary>
        /// Initializes a new instance of the ProductsController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public ProductsController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("MyGuitarShop");
        }

        /// <summary>
        /// Retrieves all products from the inventory.
        /// </summary>
        /// <returns>A list of all products.</returns>
        /// <response code="200">Returns the list of all products.</response>
        /// <response code="500">If there is a server error while retrieving products.</response>
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

        /// <summary>
        /// Retrieves a specific product by its ID.
        /// </summary>
        /// <param name="productId">The ID of the product to retrieve.</param>
        /// <returns>The product with the specified ID.</returns>
        /// <response code="200">Returns the requested product.</response>
        /// <response code="400">If the product ID is invalid.</response>
        /// <response code="500">If there is a server error while retrieving the product.</response>
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

        /// <summary>
        /// Adds a new product to the inventory.
        /// </summary>
        /// <param name="product">The product information to add.</param>
        /// <returns>The newly created product.</returns>
        /// <response code="200">Returns the newly created product.</response>
        /// <response code="400">If the product data is null or invalid.</response>
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
                {"@DiscountPercent", product.DiscountPercent},
                {"@ImageURL", product.ImageURL}
            };

            var result = await _repo.GetDataAsync("AddProduct", parameters);
            return Ok(result.FirstOrDefault());
        }

        /// <summary>
        /// Updates an existing product in the inventory.
        /// </summary>
        /// <param name="productId">The ID of the product to update.</param>
        /// <param name="product">The updated product information.</param>
        /// <returns>The updated product.</returns>
        /// <response code="200">Returns the updated product.</response>
        /// <response code="400">If the product data is null or invalid.</response>
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
                {"@DiscountPercent", product.DiscountPercent},
                {"@ImageURL", product.ImageURL}
            };

            var result = await _repo.GetDataAsync("UpdateProduct", parameters);
            return Ok(result.FirstOrDefault());
        }

        /// <summary>
        /// Deletes a product from the inventory.
        /// </summary>
        /// <param name="productId">The ID of the product to delete.</param>
        /// <returns>A success message.</returns>
        /// <response code="200">Returns a confirmation message.</response>
        /// <response code="400">If the product ID is invalid.</response>
        /// <response code="500">If there is a server error while deleting the product.</response>
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

        /// <summary>
        /// Activates a previously deactivated product.
        /// </summary>
        /// <param name="productId">The ID of the product to activate.</param>
        /// <returns>The activated product.</returns>
        /// <response code="200">Returns the activated product.</response>
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

        /// <summary>
        /// Deactivates a product without deleting it from the database.
        /// </summary>
        /// <param name="productId">The ID of the product to deactivate.</param>
        /// <returns>The deactivated product.</returns>
        /// <response code="200">Returns the deactivated product.</response>
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

        /// <summary>
        /// Retrieves featured products for display on the homepage.
        /// </summary>
        /// <returns>A list of featured products.</returns>
        /// <response code="200">Returns the list of featured products.</response>
        /// <response code="500">If there is a server error while retrieving featured products.</response>
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

        /// <summary>
        /// Retrieves the top-selling products based on sales data.
        /// </summary>
        /// <returns>A list of best-selling products.</returns>
        /// <response code="200">Returns the list of best-selling products.</response>
        /// <response code="500">If there is a server error while retrieving best sellers.</response>
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

        /// <summary>
        /// Maps a database row to a Product object.
        /// </summary>
        /// <param name="row">The database row containing product data.</param>
        /// <returns>A Product object populated with the row data.</returns>
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
                ImageURL = row.ContainsKey("ImageURL") ? row["ImageURL"]?.ToString() : null,
                IsActive = row.ContainsKey("IsActive") && row["IsActive"] != DBNull.Value
                    ? Convert.ToBoolean(row["IsActive"])
                    : true,
                DateUpdated = row["DateUpdated"] == DBNull.Value 
                    ? null 
                    : Convert.ToDateTime(row["DateUpdated"])
            };
        }

    }
}
