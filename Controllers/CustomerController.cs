using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinalProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly IDataRepository _repo;

        public CustomerController(IDataRepositoryFactory factory)
        {
            // This ensures the repository connects to the MyGuitarShop database
            _repo = factory.Create("MyGuitarShop");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Customer customer)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", customer.EmailAddress },
                { "@Password", customer.Password },
                { "@FirstName", customer.FirstName },
                { "@LastName", customer.LastName },
                { "@ShippingAddressID", customer.ShippingAddressID },
                { "@BillingAddressID", customer.BillingAddressID }
            };

            var result = await _repo.GetDataAsync("CustomerRegister", parameters);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Customer login)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", login.EmailAddress },
                { "@Password", login.Password }
            };

            var result = await _repo.GetDataAsync("CustomerLogin", parameters);
            if (!result.Any()) return Unauthorized("Invalid credentials");
            return Ok(result.First());
        }

        [HttpGet("exists/{email}")]
        public async Task<IActionResult> CheckExists(string email)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", email }
            };

            var result = await _repo.GetDataAsync("CheckCustomerExists", parameters);
            return Ok(result.FirstOrDefault());
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomerProfile(int customerId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", customerId }
            };

            var result = await _repo.GetDataAsync("GetCustomerProfile", parameters);

            if (!result.Any())
                return NotFound("Customer not found.");

            return Ok(result.First());
        }

    }
}
