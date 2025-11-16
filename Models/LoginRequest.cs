namespace FinalProjectAPI.Models;

/// <summary>
/// Represents a login request from a user.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string EmailAddress { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's password.
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the role the user is attempting to login as (customer, vendor, or admin).
    /// </summary>
    public string Role { get; set; } = string.Empty;
}
