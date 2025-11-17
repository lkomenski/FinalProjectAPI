namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a request to change a customer's password.
    /// </summary>
    public class ChangePasswordRequest
    {
        /// <summary>
        /// Gets or sets the customer ID.
        /// </summary>
        public int CustomerID { get; set; }

        /// <summary>
        /// Gets or sets the customer's current password.
        /// </summary>
        public string? OldPassword { get; set; }

        /// <summary>
        /// Gets or sets the new password.
        /// </summary>
        public string? NewPassword { get; set; }

        /// <summary>
        /// Gets or sets the confirmation of the new password.
        /// </summary>
        public string? ConfirmPassword { get; set; }
    }
}