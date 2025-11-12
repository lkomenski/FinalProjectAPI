using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IDataRepository _repo;

        public CategoriesController(IDataRepositoryFactory factory)
        {
            _repo = factory.Create("MyGuitarShop");
        }

        // GET: api/categories
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

        // GET: api/categories/{categoryId}/products
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
                    DateUpdated = row["DateUpdated"] == DBNull.Value
                        ? null
                        : Convert.ToDateTime(row["DateUpdated"])
                })
                .ToList();

            return Ok(products);
        }
    }
}
