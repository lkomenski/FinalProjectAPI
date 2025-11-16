using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for handling user authentication across all user roles.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        /// <summary>
        /// Initializes a new instance of the LoginController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public LoginController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        /// <summary>
        /// Authenticates a user by checking credentials against customer, employee, and vendor databases.
        /// </summary>
        /// <param name="request">The login credentials containing email and password.</param>
        /// <returns>User information if authentication is successful.</returns>
        /// <response code="200">Returns the authenticated user information and role.</response>
        /// <response code="400">If the login request is invalid.</response>
        /// <response code="401">If the credentials are invalid.</response>
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.EmailAddress) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Invalid login request.");

            // Try Customer (MyGuitarShop)
            var customerRepo = _factory.Create("MyGuitarShop");
            var customerResult = await customerRepo.GetDataAsync("CustomerLogin", new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            });

            if (customerResult.Any())
            {
                var c = customerResult.First();
                return Ok(new
                {
                    Role = "Customer",
                    User = new
                    {
                        Id = c["CustomerID"],
                        Name = $"{c["FirstName"]} {c["LastName"]}",
                        Email = c["EmailAddress"]
                    }
                });
            }

            // Try Employee (MyGuitarShop)
            var adminResult = await customerRepo.GetDataAsync("EmployeeLogin", new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            });

            if (adminResult.Any())
            {
                var a = adminResult.First();
                return Ok(new
                {
                    Role = "Employee",
                    User = new
                    {
                        Id = a["AdminID"],
                        Name = $"{a["FirstName"]} {a["LastName"]}",
                        Email = a["EmailAddress"]
                    }
                });
            }

            // Try Vendor (AP)
            var vendorRepo = _factory.Create("AP");
            var vendorResult = await vendorRepo.GetDataAsync("VendorLogin", new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password }
            });

            if (vendorResult.Any())
            {
                var v = vendorResult.First();
                return Ok(new
                {
                    Role = "Vendor",
                    User = new
                    {
                        Id = v["VendorID"],
                        Name = $"{v["VendorContactFName"]} {v["VendorContactLName"]}",
                        Email = request.EmailAddress
                    }
                });
            }

            return Unauthorized("Invalid email or password.");
        }
    }
}
