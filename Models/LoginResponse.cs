namespace FinalProjectAPI.Models;

/// <summary>
/// Represents the response returned after a successful login.
/// </summary>
public class LoginResponse
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the user's role (customer, vendor, or admin).
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string LastName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string? EmailAddress { get; set; }

    /// <summary>
    /// Gets or sets the dashboard type the user should be redirected to.
    /// </summary>
    public string Dashboard { get; set; } = string.Empty;
}
