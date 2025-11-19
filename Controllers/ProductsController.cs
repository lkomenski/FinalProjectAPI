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
                if (productId <= 0)
                {
                    return BadRequest("Invalid ProductID.");
                }
                
                var parameters = new Dictionary<string, object?>
                {
                    {"@ProductID", productId}
                };
                
                var result = await _repo.GetDataAsync("GetProductById", parameters);
                return Ok(result.FirstOrDefault());
            }
            catch (Exception)
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
                {"@ImageURL", product.ImageURL},
                {"@QuantityOnHand", product.QuantityOnHand}
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

            // Stored procedure will handle filling in missing data from existing record
            var parameters = new Dictionary<string, object?>
            {
                {"@ProductID", product.ProductID},
                {"@CategoryID", product.CategoryID > 0 ? product.CategoryID : 0},
                {"@ProductCode", product.ProductCode ?? string.Empty},
                {"@ProductName", product.ProductName ?? string.Empty},
                {"@Description", product.Description ?? string.Empty},
                {"@ListPrice", product.ListPrice > 0 ? product.ListPrice : 0},
                {"@DiscountPercent", product.DiscountPercent >= 0 ? product.DiscountPercent : 0},
                {"@ImageURL", product.ImageURL ?? string.Empty},
                {"@QuantityOnHand", product.QuantityOnHand >= 0 ? (object)product.QuantityOnHand : DBNull.Value}
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
                if (productId <= 0)
                {
                    return BadRequest("Invalid ProductID.");
                }
                
                var parameters = new Dictionary<string, object?>
                {
                    {"@ProductID", productId}
                };

                await _repo.GetDataAsync("DeleteProduct", parameters);
                return Ok($"Product {productId} deleted successfully.");
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to delete product.");
            }
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
        /// Retrieves featured products for display (products with highest discounts).
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
        /// Uploads a product image to the appropriate category folder.
        /// </summary>
        /// <param name="file">The image file to upload.</param>
        /// <param name="categoryName">The category name (Guitars, Basses, or Drums) to determine the folder.</param>
        /// <returns>The URL path to the uploaded image.</returns>
        /// <response code="200">Returns the image URL path.</response>
        /// <response code="400">If no file is uploaded or the file type is invalid.</response>
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] string categoryName)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded.");

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                    return BadRequest("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest("File size must be less than 5MB.");

                // Determine the appropriate folder based on category
                string folderPath;
                switch (categoryName?.ToLower())
                {
                    case "guitars":
                        folderPath = "guitars";
                        break;
                    case "basses":
                        folderPath = "basses";
                        break;
                    case "drums":
                        folderPath = "drums";
                        break;
                    default:
                        folderPath = "guitars"; // Default to guitars if unknown
                        break;
                }

                // Get the client app's public/images directory
                var clientAppPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "client-app", "public", "images", folderPath);
                
                // Ensure directory exists
                if (!Directory.Exists(clientAppPath))
                    Directory.CreateDirectory(clientAppPath);

                // Generate unique filename to avoid collisions
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(clientAppPath, fileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Return the relative URL path
                var imageUrl = $"/images/{folderPath}/{fileName}";
                return Ok(new { imageUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
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
                CategoryName = row.ContainsKey("CategoryName") ? row["CategoryName"]?.ToString() : null,
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
                QuantityOnHand = row.ContainsKey("QuantityOnHand") && row["QuantityOnHand"] != DBNull.Value
                    ? Convert.ToInt32(row["QuantityOnHand"])
                    : 0,
                DateUpdated = row["DateUpdated"] == DBNull.Value 
                    ? null 
                    : Convert.ToDateTime(row["DateUpdated"])
            };
        }

        /// <summary>
        /// Deactivates a product by setting IsActive to false.
        /// </summary>
        /// <param name="request">Object containing the ProductID to deactivate.</param>
        /// <returns>A success message if the product was deactivated.</returns>
        /// <response code="200">Product deactivated successfully.</response>
        /// <response code="400">If the request is invalid or ProductID is missing.</response>
        /// <response code="500">If there is a server error while deactivating the product.</response>
        [HttpPost("deactivate")]
        public async Task<IActionResult> DeactivateProduct([FromBody] DeactivateProductRequest request)
        {
            try
            {
                if (request?.ProductID == null || request.ProductID <= 0)
                {
                    return BadRequest("Invalid ProductID.");
                }

                var parameters = new Dictionary<string, object?>
                {
                    { "@ProductID", request.ProductID }
                };

                await _repo.GetDataAsync("DeactivateProduct", parameters);
                return Ok(new { message = "Product deactivated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }

    /// <summary>
    /// Request model for deactivating a product.
    /// </summary>
    public class DeactivateProductRequest
    {
        public int ProductID { get; set; }
    }
}
