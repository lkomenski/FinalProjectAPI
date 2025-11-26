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
                
                var rows = await _repo.GetDataAsync("GetProductById", parameters);
                var product = rows.Select(MapRowToProduct).FirstOrDefault();
                return Ok(product);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve product.");
            }
        }

        /// <summary>
        /// Adds a new product to the inventory.
        /// </summary>
        /// <param name="newProduct">The product information to add.</param>
        /// <returns>The newly created product.</returns>
        /// <response code="200">Returns the newly created product.</response>
        /// <response code="400">If the product data is null or invalid.</response>
        /// <response code="500">If there is a server error while adding the product.</response>
        [HttpPost]
        public async Task<IActionResult> AddProduct([FromBody] Product newProduct)
        {
            try
            {
                if (newProduct == null)
                    return BadRequest("Product data is required.");

                var parameters = new Dictionary<string, object?>
                {
                    {"@CategoryID", newProduct.CategoryID},
                    {"@ProductCode", newProduct.ProductCode},
                    {"@ProductName", newProduct.ProductName},
                    {"@Description", newProduct.Description},
                    {"@ListPrice", newProduct.ListPrice},
                    {"@DiscountPercent", newProduct.DiscountPercent},
                    {"@ImageURL", newProduct.ImageURL},
                    {"@QuantityOnHand", newProduct.QuantityOnHand}
                };

                var rows = await _repo.GetDataAsync("AddProduct", parameters);
                var product = rows.Select(MapRowToProduct).FirstOrDefault();

                return Ok(product);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to add product.");
            }
        }

        /// <summary>
        /// Updates an existing product in the inventory.
        /// </summary>
        /// <param name="productId">The ID of the product to update.</param>
        /// <param name="product">The updated product information.</param>
        /// <returns>The updated product.</returns>
        /// <response code="200">Returns the updated product.</response>
        /// <response code="400">If the product data is null, invalid, or productId is invalid.</response>
        /// <response code="500">If there is a server error while updating the product.</response>
        [HttpPut("{productId}")]
        public async Task<IActionResult> UpdateProduct(int productId, [FromBody] Product product)
        {
            try
            {
                if (product == null)
                    return BadRequest("Product data is required.");

                if (productId <= 0)
                    return BadRequest("Invalid ProductID.");

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

                var rows = await _repo.GetDataAsync("UpdateProduct", parameters);
                var updatedProduct = rows.Select(MapRowToProduct).FirstOrDefault();
                return Ok(updatedProduct);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to update product.");
            }
        }

        /// <summary>
        /// Deletes a product from the inventory (soft delete by default).
        /// </summary>
        /// <param name="productId">The ID of the product to delete.</param>
        /// <returns>No content on successful deletion.</returns>
        /// <response code="204">Product successfully deactivated.</response>
        /// <response code="400">If the product ID is invalid.</response>
        /// <response code="500">If there is a server error while deleting the product.</response>
        [HttpDelete("{productId}", Name = "DeleteProduct")]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            try
            {
                if (productId <= 0)
                {
                    return BadRequest("Invalid ProductID.");
                }
                
                // Call stored procedure to perform a soft delete (set IsActive = 0)
                var parameters = new Dictionary<string, object?>
                {
                    { "@ProductID", productId },
                    // Use Delete = 0 to indicate soft-delete (stored proc will set IsActive = 0)
                    { "@Delete", 0 }
                };

                await _repo.GetDataAsync("DeleteProduct", parameters);

                return NoContent();
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
        /// <response code="400">If the product ID is invalid.</response>
        /// <response code="500">If there is a server error while activating the product.</response>
        [HttpPut("activate/{productId}")]
        public async Task<IActionResult> ActivateProduct(int productId)
        {
            try
            {
                if (productId <= 0)
                    return BadRequest("Invalid ProductID.");

                var parameters = new Dictionary<string, object?>
                {
                    { "@ProductID", productId }
                };

                var rows = await _repo.GetDataAsync("ActivateProduct", parameters);
                var product = rows.Select(MapRowToProduct).FirstOrDefault();
                return Ok(product);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to activate product.");
            }
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
                var products = rows.Select(MapRowToProduct).ToList();
                return Ok(products);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to load featured products.");
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
                var products = rows.Select(MapRowToProduct).ToList();
                return Ok(products);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to load best sellers.");
            }
        }

        /// <summary>
        /// Uploads a product image to the appropriate category folder.
        /// </summary>
        /// <param name="file">The image file to upload.</param>
        /// <param name="categoryName">The category name (Guitars, Basses, or Drums) to determine the folder.</param>
        /// <returns>The URL path to the uploaded image.</returns>
        /// <response code="200">Returns the image URL path.</response>
        /// <response code="400">If no file is uploaded, file type is invalid, or file size exceeds 5MB.</response>
        /// <response code="500">If there is a server error while uploading the image.</response>
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
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to upload image.");
            }
        }

        /// <summary>
        /// Maps a database row to a Product object with safe type conversion and null handling.
        /// </summary>
        /// <param name="row">The database row containing product data.</param>
        /// <returns>A Product object populated with the row data, using default values for missing or null fields.</returns>
        public static Product MapRowToProduct(IDictionary<string, object?> row)
        {
            return new Product
            {
                ProductID = row.ContainsKey("ProductID") && row["ProductID"] != DBNull.Value ? Convert.ToInt32(row["ProductID"]) : 0,
                CategoryID = row.ContainsKey("CategoryID") && row["CategoryID"] != DBNull.Value ? Convert.ToInt32(row["CategoryID"]) : 0,
                CategoryName = row.ContainsKey("CategoryName") ? row["CategoryName"]?.ToString() ?? string.Empty : string.Empty,
                ProductCode = row.ContainsKey("ProductCode") ? row["ProductCode"]?.ToString() ?? string.Empty : string.Empty,
                ProductName = row.ContainsKey("ProductName") ? row["ProductName"]?.ToString() ?? string.Empty : string.Empty,
                Description = row.ContainsKey("Description") ? row["Description"]?.ToString() ?? string.Empty : string.Empty,
                ListPrice = row.ContainsKey("ListPrice") && row["ListPrice"] != DBNull.Value ? Convert.ToDecimal(row["ListPrice"]) : 0.0m,
                DiscountPercent = row.ContainsKey("DiscountPercent") && row["DiscountPercent"] != DBNull.Value ? Convert.ToDecimal(row["DiscountPercent"]) : 0.0m,
                ImageURL = row.ContainsKey("ImageURL") && row["ImageURL"] != DBNull.Value ? row["ImageURL"]?.ToString() ?? string.Empty : string.Empty,
                IsActive = row.ContainsKey("IsActive") && row["IsActive"] != DBNull.Value ? Convert.ToBoolean(row["IsActive"]) : true,
                QuantityOnHand = row.ContainsKey("QuantityOnHand") && row["QuantityOnHand"] != DBNull.Value ? Convert.ToInt32(row["QuantityOnHand"]) : 0,
                DateAdded = row.ContainsKey("DateAdded") && row["DateAdded"] != DBNull.Value ? Convert.ToDateTime(row["DateAdded"]) : DateTime.Now,
                DateUpdated = row.ContainsKey("DateUpdated") && row["DateUpdated"] != DBNull.Value ? Convert.ToDateTime(row["DateUpdated"]) : null
            };
        }
        /// <summary>
        /// Deactivates a product by setting IsActive to false.
        /// </summary>
        /// <param name="productId">The ID of the product to deactivate.</param>
        /// <returns>The deactivated product.</returns>
        /// <response code="200">Returns the deactivated product.</response>
        /// <response code="400">If the product ID is invalid.</response>
        /// <response code="500">If there is a server error while deactivating the product.</response>
        [HttpPut("deactivate/{productId}")]
        public async Task<IActionResult> DeactivateProduct(int productId)
        {
            try
            {
                if (productId <= 0)
                {
                    return BadRequest("Invalid ProductID.");
                }

                var parameters = new Dictionary<string, object?>
                {
                    { "@ProductID", productId }
                };

                var rows = await _repo.GetDataAsync("DeactivateProduct", parameters);
                var product = rows.Select(MapRowToProduct).FirstOrDefault();
                return Ok(product);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to deactivate product.");
            }
        }

    }
}
