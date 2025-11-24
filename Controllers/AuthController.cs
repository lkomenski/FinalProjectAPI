using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;
using BCrypt.Net;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller responsible for user authentication, registration, and password reset operations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        /// <summary>
        /// Initializes a new instance of the AuthController.
        /// </summary>
        /// <param name="factory">The data repository factory for database operations.</param>
        public AuthController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        /// <summary>
        /// Maps a database row to a LoginResponse object for customer authentication.
        /// </summary>
        /// <param name="row">The database row containing customer data.</param>
        /// <returns>A LoginResponse object with safe null handling.</returns>
        private static LoginResponse MapRowToCustomerLoginResponse(IDictionary<string, object?> row)
        {
            return new LoginResponse
            {
                Id = row.ContainsKey("CustomerID") && row["CustomerID"] != DBNull.Value ? Convert.ToInt32(row["CustomerID"]) : 0,
                Role = "customer",
                FirstName = row.ContainsKey("FirstName") ? row["FirstName"]?.ToString() ?? "" : "",
                LastName = row.ContainsKey("LastName") ? row["LastName"]?.ToString() ?? "" : "",
                EmailAddress = row.ContainsKey("EmailAddress") ? row["EmailAddress"]?.ToString() ?? "" : "",
                Dashboard = "customer"
            };
        }

        /// <summary>
        /// Maps a database row to a LoginResponse object for vendor authentication.
        /// </summary>
        /// <param name="row">The database row containing vendor data.</param>
        /// <returns>A LoginResponse object with safe null handling.</returns>
        private static LoginResponse MapRowToVendorLoginResponse(IDictionary<string, object?> row)
        {
            return new LoginResponse
            {
                Id = row.ContainsKey("VendorID") && row["VendorID"] != DBNull.Value ? Convert.ToInt32(row["VendorID"]) : 0,
                Role = "vendor",
                FirstName = row.ContainsKey("FirstName") ? row["FirstName"]?.ToString() ?? "" : "",
                LastName = row.ContainsKey("LastName") ? row["LastName"]?.ToString() ?? "" : "",
                EmailAddress = row.ContainsKey("VendorEmail") ? row["VendorEmail"]?.ToString() ?? "" : "",
                Dashboard = "vendor"
            };
        }

        /// <summary>
        /// Maps a database row to a LoginResponse object for admin/employee authentication.
        /// </summary>
        /// <param name="row">The database row containing admin/employee data.</param>
        /// <returns>A LoginResponse object with safe null handling.</returns>
        private static LoginResponse MapRowToAdminLoginResponse(IDictionary<string, object?> row)
        {
            return new LoginResponse
            {
                Id = row.ContainsKey("AdminID") && row["AdminID"] != DBNull.Value ? Convert.ToInt32(row["AdminID"]) : 0,
                Role = "admin",
                FirstName = row.ContainsKey("FirstName") ? row["FirstName"]?.ToString() ?? "" : "",
                LastName = row.ContainsKey("LastName") ? row["LastName"]?.ToString() ?? "" : "",
                EmailAddress = row.ContainsKey("EmailAddress") ? row["EmailAddress"]?.ToString() ?? "" : "",
                Dashboard = "admin"
            };
        }

        /// <summary>
        /// Maps a database row to a vendor registration response object.
        /// </summary>
        /// <param name="row">The database row containing vendor registration result data.</param>
        /// <returns>A structured vendor registration response with safe null handling.</returns>
        private static object MapRowToVendorRegistrationResponse(IDictionary<string, object?> row)
        {
            return new
            {
                Message = row.ContainsKey("Message") ? row["Message"]?.ToString() ?? "Registration successful." : "Registration successful.",
                VendorID = row.ContainsKey("VendorID") && row["VendorID"] != DBNull.Value ? row["VendorID"] : null,
                FirstName = row.ContainsKey("FirstName") ? row["FirstName"]?.ToString() : null,
                LastName = row.ContainsKey("LastName") ? row["LastName"]?.ToString() : null,
                Email = row.ContainsKey("VendorEmail") ? row["VendorEmail"]?.ToString() : null
            };
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
            try
            {
                var repo = _factory.Create("MyGuitarShop");

                var parameters = new Dictionary<string, object?>
                {
                    { "@EmailAddress", request.EmailAddress }
                };

                // Get customer by email (we'll verify password in C# instead of SQL)
                var results = await repo.GetDataAsync("CustomerLogin", parameters);
                var row = results.FirstOrDefault();

                if (row == null)
                    return Unauthorized("Invalid customer credentials.");

                // Verify password - support both hashed and plain text for backward compatibility
                string storedPassword = row["Password"]?.ToString() ?? "";
                bool passwordValid = false;
                
                // Check if password is hashed (BCrypt hashes start with $2a$, $2b$, etc.)
                if (storedPassword.StartsWith("$2"))
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, storedPassword);
                }
                else
                {
                    // Plain text password (for testing/legacy data)
                    passwordValid = request.Password == storedPassword;
                }
                
                if (!passwordValid)
                    return Unauthorized("Invalid customer credentials.");

                var response = MapRowToCustomerLoginResponse(row);

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to authenticate customer.");
            }
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
            try
            {
                var repo = _factory.Create("AP");

                var parameters = new Dictionary<string, object?>
                {
                    { "@EmailAddress", request.EmailAddress }
                };

                // Get vendor by email (we'll verify password in C# instead of SQL)
                var results = await repo.GetDataAsync("VendorLogin", parameters);
                var row = results.FirstOrDefault();

                if (row == null)
                    return Unauthorized("Invalid vendor credentials.");

                // Verify password - support both hashed and plain text for backward compatibility
                string storedPassword = row["VendorPassword"]?.ToString() ?? "";
                bool passwordValid = false;
                
                // Check if password is hashed (BCrypt hashes start with $2a$, $2b$, etc.)
                if (storedPassword.StartsWith("$2"))
                {
                    passwordValid = BCrypt.Net.BCrypt.Verify(request.Password, storedPassword);
                }
                else
                {
                    // Plain text password (for testing/legacy data)
                    passwordValid = request.Password == storedPassword;
                }
                
                if (!passwordValid)
                    return Unauthorized("Invalid vendor credentials.");

                var response = MapRowToVendorLoginResponse(row);

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to authenticate vendor.");
            }
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
            try
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

                var response = MapRowToAdminLoginResponse(row);

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to authenticate admin/employee.");
            }
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
            try
            {
                if (request == null)
                    return BadRequest("Registration data is required.");

                if (string.IsNullOrEmpty(request.EmailAddress) ||
                    string.IsNullOrEmpty(request.Password) ||
                    string.IsNullOrEmpty(request.FirstName) ||
                    string.IsNullOrEmpty(request.LastName))
                {
                    return BadRequest("All fields are required.");
                }

                // Hash the password before storing
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var repo = _factory.Create("MyGuitarShop");

                var parameters = new Dictionary<string, object?>
                {
                    { "@EmailAddress", request.EmailAddress },
                    { "@Password", hashedPassword },
                    { "@FirstName", request.FirstName },
                    { "@LastName", request.LastName }
                };

                var results = await repo.GetDataAsync("CustomerRegister", parameters);
                var row = results.FirstOrDefault();

                if (row == null)
                    return StatusCode(500, "Internal server error: Registration failed.");

                int customerId = row.ContainsKey("CustomerID") && row["CustomerID"] != DBNull.Value ? Convert.ToInt32(row["CustomerID"]) : -1;
                if (customerId == -1)
                    return BadRequest("An account with this email already exists.");

                var response = MapRowToCustomerLoginResponse(row);

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to register customer.");
            }
        }

        // --------------------------------------------------------
        // PASSWORD RESET 
        // --------------------------------------------------------
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
            try
            {
                if (req == null || string.IsNullOrEmpty(req.EmailAddress))
                    return BadRequest("Email address is required.");

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
                return Ok(new { token = token, message = "Reset token generated successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to process password reset request.");
            }
        }

        /// <summary>
        /// Resets a user's password using a valid reset token.
        /// </summary>
        /// <param name="req">The reset request containing email, reset token, and new password.</param>
        /// <returns>Success message if password is updated.</returns>
        /// <response code="200">Returns success message when password is updated.</response>
        /// <response code="400">If the reset request is invalid.</response>
        /// <response code="500">If there is a server error while resetting password.</response>
        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto req)
        {
            try
            {
                if (req == null || string.IsNullOrEmpty(req.EmailAddress) || 
                    string.IsNullOrEmpty(req.ResetToken) || string.IsNullOrEmpty(req.NewPassword))
                    return BadRequest("Email, reset token, and new password are required.");

                var repo = _factory.Create("MyGuitarShop");

                // Hash the new password before storing
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);

                var parameters = new Dictionary<string, object?>
                {
                    { "@EmailAddress", req.EmailAddress },
                    { "@ResetToken", req.ResetToken },
                    { "@NewPassword", hashedPassword }
                };

                await repo.GetDataAsync("CustomerResetPassword", parameters);

                return Ok(new { message = "Password updated successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to reset password.");
            }
        }

        // --------------------------------------------------------
        // VENDOR REGISTRATION
        // --------------------------------------------------------
        /// <summary>
        /// Registers a vendor account using a registration token provided by admin.
        /// </summary>
        /// <param name="request">The registration request containing token, email, and password.</param>
        /// <returns>Success message if vendor account is activated.</returns>
        /// <response code="200">Returns success message when vendor account is activated.</response>
        /// <response code="400">If token is invalid or email doesn't match.</response>
        [HttpPost("register-vendor")]
        public async Task<IActionResult> RegisterVendor([FromBody] VendorRegisterRequest request)
        {
            try
            {
                if (request == null)
                    return BadRequest("Registration data is required.");

                if (string.IsNullOrEmpty(request.RegistrationToken) ||
                    string.IsNullOrEmpty(request.VendorEmail) ||
                    string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest("Registration token, email, and password are required.");
                }

                var repo = _factory.Create("AP");

                // Hash the password before storing
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var parameters = new Dictionary<string, object?>
                {
                    { "@RegistrationToken", request.RegistrationToken },
                    { "@VendorEmail", request.VendorEmail },
                    { "@Password", hashedPassword }
                };

                var results = await repo.GetDataAsync("VendorRegister", parameters);
                var row = results.FirstOrDefault();

                if (row == null)
                    return StatusCode(500, "Internal server error: Registration failed.");

                string status = row.ContainsKey("Status") ? row["Status"]?.ToString() ?? "" : "";
                if (status == "Error")
                {
                    return BadRequest(row.ContainsKey("Message") ? row["Message"]?.ToString() ?? "Registration failed." : "Registration failed.");
                }

                var response = MapRowToVendorRegistrationResponse(row);

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error: Failed to register vendor.");
            }
        }

    }
}
