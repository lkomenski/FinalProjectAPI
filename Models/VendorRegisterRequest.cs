namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Request model for vendor registration using an invitation token.
    /// </summary>
    public class VendorRegisterRequest
    {
        /// <summary>
        /// Unique registration token provided by admin.
        /// </summary>
        public string RegistrationToken { get; set; } = string.Empty;

        /// <summary>
        /// Vendor's business email address (must match existing vendor record).
        /// </summary>
        public string VendorEmail { get; set; } = string.Empty;

        /// <summary>
        /// Password for the vendor account (will be hashed with BCrypt).
        /// </summary>
        public string Password { get; set; } = string.Empty;
    }
}
