using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for managing product categories.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IDataRepository _repo;

        /// <summary>
        /// Initializes a new instance of the CategoriesController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public CategoriesController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("MyGuitarShop");
        }

        // ---------------------------------------------------------
        // GET: api/categories   (get all categories)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all product categories.
        /// </summary>
        /// <returns>A list of all categories.</returns>
        /// <response code="200">Returns the list of all categories.</response>
        /// <response code="500">If there is a server error while retrieving categories.</response>
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var rows = await _repo.GetDataAsync("GetCategories");
                var categories = rows.Select(MapRowToCategory).ToList();
                return Ok(categories);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve categories.");
            }
        }

        // ---------------------------------------------------------
        // GET: api/categories/{categoryId}/products   (get products by category)
        // ---------------------------------------------------------
        /// <summary>
        /// Retrieves all products belonging to a specific category.
        /// </summary>
        /// <param name="categoryId">The ID of the category.</param>
        /// <returns>A list of products in the specified category.</returns>
        /// <response code="200">Returns the list of products in the category.</response>
        /// <response code="400">If the category ID is invalid.</response>
        /// <response code="500">If there is a server error while retrieving products.</response>
        [HttpGet("{categoryId}/products")]
        public async Task<IActionResult> GetProductsByCategory(int categoryId)
        {
            try
            {
                if (categoryId <= 0)
                    return BadRequest("Invalid CategoryID.");

                var rows = await _repo.GetDataAsync(
                    "GetProductsByCategory",
                    new Dictionary<string, object?>
                    {
                        { "@CategoryID", categoryId }
                    }
                );

                // Handle case where no products exist
                if (rows == null || !rows.Any())
                    return Ok(new List<Product>());

                var products = rows.Where(row => row != null).Select(ProductsController.MapRowToProduct).ToList();
                return Ok(products);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to retrieve products by category.");
            }
        }

        /// <summary>
        /// Maps a database row to a Category object with safe type conversion and null handling.
        /// </summary>
        /// <param name="row">The database row containing category data.</param>
        /// <returns>A Category object populated with the row data, using default values for missing or null fields.</returns>
        private static Category MapRowToCategory(IDictionary<string, object?> row)
        {
            return new Category
            {
                CategoryID = row.ContainsKey("CategoryID") && row["CategoryID"] != DBNull.Value ? Convert.ToInt32(row["CategoryID"]) : 0,
                CategoryName = row.ContainsKey("CategoryName") ? row["CategoryName"]?.ToString() ?? string.Empty : string.Empty
            };
        }
    }
}
