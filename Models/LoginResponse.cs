namespace FinalProjectAPI.Models
{
    public class LoginResponse
    {
        public int UserID { get; set; }
        public string Role { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string Dashboard { get; set; } = string.Empty; // e.g. "customer", "vendor", or "admin"
    }
}
