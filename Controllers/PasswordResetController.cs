using Microsoft.AspNetCore.Mvc;
using FinalProjectAPI.Infrastructure.Interfaces;
using FinalProjectAPI.Models;
using System.Security.Cryptography;
using System.Text;

namespace FinalProjectAPI.Controllers
{
    /// <summary>
    /// Controller for handling customer password reset operations.
    /// </summary>
    [ApiController]
    [Route("api/password")]
    public class PasswordResetController : ControllerBase
    {
        private readonly IDataRepositoryFactory _factory;

        /// <summary>
        /// Initializes a new instance of the PasswordResetController.
        /// </summary>
        /// <param name="factory">The data repository factory for database access.</param>
        public PasswordResetController(IDataRepositoryFactory factory)
        {
            _factory = factory;
        }

        /// <summary>
        /// Initiates a password reset request by generating a secure reset token.
        /// </summary>
        /// <param name="request">The password reset request containing the user's email address.</param>
        /// <returns>A confirmation message with the reset token (token returned for development purposes only).</returns>
        /// <response code="200">Returns a success message and reset token.</response>
        /// <response code="400">If the email address is missing or invalid.</response>
        /// <remarks>
        /// In production, the token should be sent via email rather than returned in the response.
        /// The token is a cryptographically secure random value that expires after a set period.
        /// </remarks>
        [HttpPost("request-reset")]
        public async Task<IActionResult> RequestReset([FromBody] ResetRequestDto request)
        {
            if (string.IsNullOrEmpty(request.EmailAddress))
                return BadRequest("Email required.");

            var repo = _factory.Create("MyGuitarShop");

            // Create secure random token
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@ResetToken", token }
            };

            await repo.GetDataAsync("SavePasswordResetToken", parameters);

            // Normally email would be sent here
            return Ok(new { message = "Reset link sent.", token = token });
        }

        /// <summary>
        /// Resets a customer's password using a valid reset token.
        /// </summary>
        /// <param name="request">The password reset information including email, token, new password, and confirmation.</param>
        /// <returns>A confirmation message indicating the password was updated successfully.</returns>
        /// <response code="200">Returns a success message if the password was reset.</response>
        /// <response code="400">If the password doesn't meet requirements, passwords don't match, or the token is invalid.</response>
        /// <remarks>
        /// Password requirements:
        /// - Minimum 8 characters
        /// - Must contain at least one digit
        /// - New password and confirmation must match
        /// The reset token is cleared after successful password reset.
        /// </remarks>
        [HttpPut("reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            if (!IsValidPassword(request.NewPassword))
                return BadRequest("Password must be 8+ characters and include at least one number.");

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest("Passwords do not match.");

            var repo = _factory.Create("MyGuitarShop");

            var parameters = new Dictionary<string, object?>
            {
                { "@EmailAddress", request.EmailAddress },
                { "@ResetToken", request.ResetToken },
                { "@NewPassword", request.NewPassword }
            };

            await repo.GetDataAsync("CustomerResetPassword", parameters);

            return Ok(new { message = "Password updated successfully." });
        }

        /// <summary>
        /// Validates that a password meets the minimum security requirements.
        /// </summary>
        /// <param name="pass">The password to validate.</param>
        /// <returns>True if the password is valid; otherwise, false.</returns>
        /// <remarks>
        /// Password must:
        /// - Not be null or whitespace
        /// - Be at least 8 characters long
        /// - Contain at least one numeric digit
        /// </remarks>
        private bool IsValidPassword(string pass)
        {
            if (string.IsNullOrWhiteSpace(pass)) return false;
            if (pass.Length < 8) return false;
            if (!pass.Any(char.IsDigit)) return false;

            return true;
        }
    }
}
