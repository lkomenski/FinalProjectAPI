using FinalProjectAPI.Models;
using FinalProjectAPI.Infrastructure.Interfaces;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

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
        /// Registers a new customer account. Addresses will be added later during checkout or profile update.
        /// </summary>
        /// <param name="request">The customer registration information.</param>
        /// <returns>The newly created customer.</returns>
        /// <response code="200">Returns the newly registered customer.</response>
        /// <response code="400">If the registration data is invalid or email already exists.</response>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CustomerRegisterRequest request)
        {
            // Validate required fields
            if (string.IsNullOrEmpty(request.EmailAddress) || string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
            {
                return BadRequest("Email, password, first name, and last name are required.");
            }

            // Validate password confirmation
            if (request.Password != request.ConfirmPassword)
            {
                return BadRequest("Password and confirmation password do not match.");
            }

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password },
                { "@FirstName", request.FirstName },
                { "@LastName", request.LastName }
            };

            var result = await _repo.GetDataAsync("CustomerRegister", parameters);
            var response = result.FirstOrDefault();

            if (response != null && Convert.ToInt32(response["CustomerID"]) == -1)
            {
                return BadRequest(response["ErrorMessage"]?.ToString() ?? "Registration failed.");
            }

            return Ok(response);
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

        /// <summary>
        /// Changes a customer's password after verifying their current password.
        /// </summary>
        /// <param name="request">The change password request containing customer ID, old password, and new password.</param>
        /// <returns>Confirmation message.</returns>
        /// <response code="200">Returns confirmation that the password was changed.</response>
        /// <response code="400">If the old password is incorrect or new password doesn't meet requirements.</response>
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(request.NewPassword))
                return BadRequest("Old password and new password are required.");

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest("New password and confirmation do not match.");

            if (!IsValidPassword(request.NewPassword))
                return BadRequest("Password must be at least 8 characters long and contain at least one number.");

            // First, get the customer's current password hash from the database
            var getPasswordParams = new Dictionary<string, object?>
            {
                { "@CustomerID", request.CustomerID }
            };

            var customerData = await _repo.GetDataAsync("GetCustomerPassword", getPasswordParams);
            var customer = customerData.FirstOrDefault();

            if (customer == null)
                return BadRequest("Customer not found.");

            // Verify old password using BCrypt
            string storedHashedPassword = customer["Password"]?.ToString() ?? "";
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, storedHashedPassword))
                return BadRequest("Old password is incorrect.");

            // Hash the new password
            string hashedNewPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", request.CustomerID },
                { "@OldPassword", storedHashedPassword }, // Pass the hash for stored proc verification
                { "@NewPassword", hashedNewPassword }
            };

            var result = await _repo.GetDataAsync("CustomerChangePassword", parameters);
            var response = result.FirstOrDefault();

            if (response != null && Convert.ToInt32(response["Success"]) == 1)
            {
                return Ok(new { message = response["Message"] });
            }
            else
            {
                return BadRequest(new { message = response?["Message"] ?? "Failed to change password." });
            }
        }

        /// <summary>
        /// Validates that a password meets the minimum security requirements.
        /// </summary>
        /// <param name="password">The password to validate.</param>
        /// <returns>True if the password meets requirements, false otherwise.</returns>
        private static bool IsValidPassword(string password)
        {
            return password.Length >= 8 && password.Any(char.IsDigit);
        }

        /// <summary>
        /// Adds or updates a customer's address (shipping or billing).
        /// </summary>
        /// <param name="request">The address information to add or update.</param>
        /// <returns>Confirmation of address save.</returns>
        /// <response code="200">Returns confirmation that the address was saved.</response>
        /// <response code="400">If the address data is invalid.</response>
        [HttpPut("address")]
        public async Task<IActionResult> AddOrUpdateAddress([FromBody] CustomerAddressRequest request)
        {
            if (request.CustomerID <= 0)
                return BadRequest("Valid Customer ID is required.");

            if (string.IsNullOrEmpty(request.AddressType) || 
                (request.AddressType.ToLower() != "shipping" && request.AddressType.ToLower() != "billing"))
                return BadRequest("Address type must be 'shipping' or 'billing'.");

            // Removed field validation - stored procedure will handle filling in missing data from existing record

            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", request.CustomerID },
                { "@AddressType", request.AddressType.ToLower() },
                { "@Line1", request.Line1 ?? string.Empty },
                { "@Line2", request.Line2 ?? string.Empty },
                { "@City", request.City ?? string.Empty },
                { "@State", request.State ?? string.Empty },
                { "@ZipCode", request.ZipCode ?? string.Empty },
                { "@Phone", request.Phone ?? string.Empty }
            };

            var result = await _repo.GetDataAsync("CustomerAddOrUpdateAddress", parameters);
            var response = result.FirstOrDefault();

            if (response != null && Convert.ToInt32(response["Success"]) == 0)
            {
                return BadRequest(response["ErrorMessage"]?.ToString() ?? "Failed to save address.");
            }

            return Ok(response);
        }

        /// <summary>
        /// Retrieves a customer's addresses (shipping and billing).
        /// </summary>
        /// <param name="customerId">The ID of the customer.</param>
        /// <returns>The customer's address information.</returns>
        /// <response code="200">Returns the customer's addresses.</response>
        /// <response code="404">If the customer is not found.</response>
        [HttpGet("{customerId}/addresses")]
        public async Task<IActionResult> GetCustomerAddresses(int customerId)
        {
            var parameters = new Dictionary<string, object?>
            {
                { "@CustomerID", customerId }
            };

            var result = await _repo.GetDataAsync("GetCustomerAddresses", parameters);
            var response = result.FirstOrDefault();

            if (response == null)
                return NotFound("Customer not found.");

            return Ok(response);
        }

    }
}
