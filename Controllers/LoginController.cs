using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;

namespace FinalProjectAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        public LoginController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.EmailAddress) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest("Invalid login request.");

            // Try Customer (MyGuitarShop)
            var customerRepo = _factory.Create("MyGuitarShop");
            var customerResult = await customerRepo.GetDataAsync("spCustomerLogin", new Dictionary<string, object?>
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
            var adminResult = await customerRepo.GetDataAsync("spAdminLogin", new Dictionary<string, object?>
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
            var vendorResult = await vendorRepo.GetDataAsync("spVendorLogin", new Dictionary<string, object?>
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

    public class LoginRequest
    {
        public string EmailAddress { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
