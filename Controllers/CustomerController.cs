using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for managing customer accounts and authentication.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly IDataRepository _repo;
        private readonly IDataRepositoryFactory _factory;

        /// <summary>
        /// Initializes a new instance of the CustomerController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public CustomerController(IDataRepositoryFactory factory)
        {
            _factory = factory;
            // This ensures the repository connects to the MyGuitarShop database
            _repo = factory.Create("MyGuitarShop");
        }

        /// <summary>
        /// Registers a new customer account.
        /// </summary>
        /// <param name="customer">The customer registration information.</param>
        /// <returns>The newly created customer.</returns>
        /// <response code="200">Returns the newly registered customer.</response>
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

        /// <summary>
        /// Authenticates a customer and returns their information.
        /// </summary>
        /// <param name="login">The customer login credentials.</param>
        /// <returns>The authenticated customer information.</returns>
        /// <response code="200">Returns the customer information.</response>
        /// <response code="401">If the credentials are invalid.</response>
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

        /// <summary>
        /// Checks if a customer account exists with the given email address.
        /// </summary>
        /// <param name="email">The email address to check.</param>
        /// <returns>Information about whether the customer exists.</returns>
        /// <response code="200">Returns the existence check result.</response>
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

        /// <summary>
        /// Retrieves a customer's profile information.
        /// </summary>
        /// <param name="customerId">The ID of the customer.</param>
        /// <returns>The customer's profile information.</returns>
        /// <response code="200">Returns the customer profile.</response>
        /// <response code="404">If the customer is not found.</response>
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

        /// <summary>
        /// Deactivates a customer account without permanently deleting it.
        /// </summary>
        /// <param name="id">The ID of the customer to deactivate.</param>
        /// <returns>Confirmation message.</returns>
        /// <response code="200">Returns confirmation that the customer was deactivated.</response>
        [HttpPut("deactivate/{id}")]
        public async Task<IActionResult> DeactivateCustomer(int id)
        {
            var repo = _factory.Create("MyGuitarShop");

            await repo.GetDataAsync("DeactivateCustomer", new Dictionary<string, object?> {
                { "@CustomerID", id }
            });

            return Ok($"Customer {id} deactivated.");
        }

        /// <summary>
        /// Permanently deletes a customer account from the system.
        /// </summary>
        /// <param name="id">The ID of the customer to delete.</param>
        /// <returns>Confirmation message.</returns>
        /// <response code="200">Returns confirmation that the customer was deleted.</response>
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var repo = _factory.Create("MyGuitarShop");

            await repo.GetDataAsync("DeleteCustomer", new Dictionary<string, object?> {
                { "@CustomerID", id }
            });

            return Ok($"Customer {id} deleted.");
        }

    }
}
