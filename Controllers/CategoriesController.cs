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

        /// <summary>
        /// Retrieves all product categories.
        /// </summary>
        /// <returns>A list of all categories.</returns>
        /// <response code="200">Returns the list of all categories.</response>
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var rows = await _repo.GetDataAsync("GetCategories");

            var categories = rows
                .Select(row => new Category
                {
                    CategoryID = Convert.ToInt32(row["CategoryID"]),
                    CategoryName = row["CategoryName"]?.ToString() ?? ""
                })
                .ToList();

            return Ok(categories);
        }

        /// <summary>
        /// Retrieves all products belonging to a specific category.
        /// </summary>
        /// <param name="categoryId">The ID of the category.</param>
        /// <returns>A list of products in the specified category.</returns>
        /// <response code="200">Returns the list of products in the category.</response>
        [HttpGet("{categoryId}/products")]
        public async Task<IActionResult> GetProductsByCategory(int categoryId)
        {
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

            var products = rows
                .Where(row => row != null)
                .Select(row => new Product
                {
                    ProductID = Convert.ToInt32(row["ProductID"]),
                    CategoryID = Convert.ToInt32(row["CategoryID"]),
                    ProductCode = row["ProductCode"]?.ToString() ?? "",
                    ProductName = row["ProductName"]?.ToString() ?? "",
                    Description = row["Description"]?.ToString() ?? "",
                    ListPrice = Convert.ToDecimal(row["ListPrice"]),
                    DiscountPercent = Convert.ToDecimal(row["DiscountPercent"]),
                    ImageURL = row.ContainsKey("ImageURL") ? row["ImageURL"]?.ToString() : null,
                    IsActive = row.ContainsKey("IsActive") && row["IsActive"] != DBNull.Value
                        ? Convert.ToBoolean(row["IsActive"])
                        : true,
                    DateUpdated = row["DateUpdated"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(row["DateUpdated"])
                })
                .ToList();

            return Ok(products);
        }
    }
}
