namespace FinalProjectAPI.Models;

public class LoginRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "customer", "vendor", or "admin"
}
