using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        public AuthController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.EmailAddress) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Email and password are required.");

            if (string.IsNullOrEmpty(request.Role))
                return BadRequest("Role is required.");

            string role = request.Role.ToLower();

            try
            {
                if (role == "customer")
                    return await LoginCustomerAsync(request);
                else if (role == "vendor")
                    return await LoginVendorAsync(request);
                else if (role == "admin" || role == "employee")
                    return await LoginAdminAsync(request);
                else
                    return BadRequest("Invalid role.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during login: {ex.Message}");
            }
        }

        private async Task<IActionResult> LoginCustomerAsync(LoginRequest request)
        {
            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            };

            var results = await repo.GetDataAsync("CustomerLogin", parameters);
            var row = results.FirstOrDefault();
            if (row == null) return Unauthorized("Invalid customer credentials.");

            var response = new LoginResponse
            {
                UserID = Convert.ToInt32(row["CustomerID"]),
                Role = "customer",
                FirstName = row["FirstName"]?.ToString() ?? "",
                LastName = row["LastName"]?.ToString() ?? "",
                EmailAddress = row["EmailAddress"]?.ToString() ?? "",
                Dashboard = "customer"
            };

            return Ok(response);
        }

        private async Task<IActionResult> LoginVendorAsync(LoginRequest request)
        {
            var repo = _factory.Create("AP");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            };

            var results = await repo.GetDataAsync("VendorLogin", parameters);
            var row = results.FirstOrDefault();
            if (row == null) return Unauthorized("Invalid vendor credentials.");

            var response = new LoginResponse
            {
                UserID = Convert.ToInt32(row["VendorID"]),
                Role = "vendor",
                FirstName = row["VendorContactFName"]?.ToString() ?? "",
                LastName = row["VendorContactLName"]?.ToString() ?? "",
                Dashboard = "vendor"
            };

            return Ok(response);
        }

        private async Task<IActionResult> LoginAdminAsync(LoginRequest request)
        {
            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            };

            var results = await repo.GetDataAsync("EmployeeLogin", parameters);
            var row = results.FirstOrDefault();
            if (row == null) return Unauthorized("Invalid admin credentials.");

            var response = new LoginResponse
            {
                UserID = Convert.ToInt32(row["AdminID"]),
                Role = "admin",
                FirstName = row["FirstName"]?.ToString() ?? "",
                LastName = row["LastName"]?.ToString() ?? "",
                Dashboard = "admin"
            };

            return Ok(response);
        }
    }
}
