using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller responsible for user authentication and registration operations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        /// <summary>
        /// Initializes a new instance of the AuthController class.
        /// </summary>
        /// <param name="factory">The data repository factory for creating database connections.</param>
        public AuthController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        // --------------------------------------------------------
        // LOGIN ENDPOINT
        // --------------------------------------------------------
        /// <summary>
        /// Authenticates a user based on their email, password, and role.
        /// </summary>
        /// <param name="request">The login request containing email, password, and role.</param>
        /// <returns>A login response with user information if successful, or an error message if failed.</returns>
        /// <response code="200">Returns the user information upon successful authentication.</response>
        /// <response code="400">If the request is invalid or missing required fields.</response>
        /// <response code="401">If the credentials are invalid.</response>
        /// <response code="500">If an internal server error occurs.</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.EmailAddress) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Email and password are required.");

            if (string.IsNullOrEmpty(request.Role))
                return BadRequest("Role is required.");

            string role = request.Role.ToLower().Trim();

            try
            {
                return role switch
                {
                    "customer" => await LoginCustomerAsync(request),
                    "vendor" => await LoginVendorAsync(request),
                    "admin" or "employee" => await LoginAdminAsync(request),
                    _ => BadRequest("Invalid role.")
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during login: {ex.Message}");
            }
        }

        // --------------------------------------------------------
        // CUSTOMER LOGIN
        // --------------------------------------------------------
        /// <summary>
        /// Authenticates a customer user against the MyGuitarShop database.
        /// </summary>
        /// <param name="request">The login request with email and password.</param>
        /// <returns>Login response with customer information.</returns>
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

            if (row == null)
                return Unauthorized("Invalid customer credentials.");

            var response = new LoginResponse
            {
                Id = Convert.ToInt32(row["CustomerID"]),
                Role = "customer",
                FirstName = row["FirstName"]?.ToString() ?? "",
                LastName = row["LastName"]?.ToString() ?? "",
                EmailAddress = row["EmailAddress"]?.ToString() ?? "",
                Dashboard = "customer"
            };

            return Ok(response);
        }

        // --------------------------------------------------------
        // VENDOR LOGIN
        // --------------------------------------------------------
        /// <summary>
        /// Authenticates a vendor user against the AP database.
        /// </summary>
        /// <param name="request">The login request with email and password.</param>
        /// <returns>Login response with vendor information.</returns>
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

            if (row == null)
                return Unauthorized("Invalid vendor credentials.");

            var response = new LoginResponse
            {
                Id = Convert.ToInt32(row["UserId"]),   // <-- CORRECT
                Role = "vendor",
                FirstName = row["FirstName"]?.ToString() ?? "",
                LastName = row["LastName"]?.ToString() ?? "",
                EmailAddress = row["VendorEmail"]?.ToString() ?? "",
                Dashboard = "vendor"
            };

            return Ok(response);
        }


        // --------------------------------------------------------
        // ADMIN / EMPLOYEE LOGIN
        // --------------------------------------------------------
        /// <summary>
        /// Authenticates an admin or employee user against the MyGuitarShop database.
        /// </summary>
        /// <param name="request">The login request with email and password.</param>
        /// <returns>Login response with admin/employee information.</returns>
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

            if (row == null)
                return Unauthorized("Invalid admin/employee credentials.");

            var response = new LoginResponse
            {
                Id = Convert.ToInt32(row["AdminID"]),   // FIXED
                Role = "admin",
                FirstName = row["FirstName"]?.ToString() ?? "",
                LastName = row["LastName"]?.ToString() ?? "",
                EmailAddress = row["EmailAddress"]?.ToString() ?? "",
                Dashboard = "admin"
            };

            return Ok(response);
        }

        // --------------------------------------------------------
        // CUSTOMER REGISTRATION
        // --------------------------------------------------------
        /// <summary>
        /// Registers a new customer account in the system.
        /// </summary>
        /// <param name="request">The registration request containing customer information.</param>
        /// <returns>The newly created customer information if successful.</returns>
        /// <response code="200">Returns the newly created customer information.</response>
        /// <response code="400">If the request is invalid or the email already exists.</response>
        /// <response code="500">If registration fails due to a server error.</response>
        [HttpPost("register-customer")]
        public async Task<IActionResult> RegisterCustomer([FromBody] CustomerRegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.EmailAddress) ||
                string.IsNullOrEmpty(request.Password) ||
                string.IsNullOrEmpty(request.FirstName) ||
                string.IsNullOrEmpty(request.LastName))
            {
                return BadRequest("All fields are required.");
            }

            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@Password", request.Password },
                { "@FirstName", request.FirstName },
                { "@LastName", request.LastName }
            };

            var results = await repo.GetDataAsync("CustomerRegister", parameters);
            var row = results.FirstOrDefault();

            if (row == null)
                return StatusCode(500, "Registration failed.");

            int customerId = Convert.ToInt32(row["CustomerID"]);
            if (customerId == -1)
                return BadRequest("An account with this email already exists.");

            return Ok(new
            {
                UserID = customerId,
                EmailAddress = row["EmailAddress"]?.ToString(),
                FirstName = row["FirstName"]?.ToString(),
                LastName = row["LastName"]?.ToString(),
                Role = "customer",
                Dashboard = "customer"
            });
        }

        /// <summary>
        /// Initiates a password reset request for a user by generating a reset token.
        /// </summary>
        /// <param name="req">The reset request containing the user's email address.</param>
        /// <returns>A reset token if the email exists in the system.</returns>
        /// <response code="200">Returns the generated reset token.</response>
        /// <response code="400">If the email address does not exist in the system.</response>
        [HttpPost("request-password-reset")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] ResetRequestDto req)
        {
            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", req.EmailAddress }
            };

            var results = await repo.GetDataAsync("CheckUserExists", parameters);

            if (!results.Any())
                return BadRequest("This email does not exist in our system.");

            // Generate secure token
            string token = Guid.NewGuid().ToString();

            // Save token associated with user (in DB)
            var saveParams = new Dictionary<string, object?>
            {
                { "@EmailAddress", req.EmailAddress },
                { "@ResetToken", token }
            };
            
            await repo.GetDataAsync("SavePasswordResetToken", saveParams);

            // In real apps, you'd email token — for now return it
            return Ok(token);
        }

        /// <summary>
        /// Resets a user's password using a valid reset token.
        /// </summary>
        /// <param name="req">The reset request containing email, reset token, and new password.</param>
        /// <returns>Success message if password is updated.</returns>
        /// <response code="200">Returns success message when password is updated.</response>
        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto req)
        {
            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", req.EmailAddress },
                { "@ResetToken", req.ResetToken },
                { "@NewPassword", req.NewPassword }
            };

            var result = await repo.GetDataAsync("ResetPassword", parameters);

            return Ok("Password updated.");
        }

    }
}
