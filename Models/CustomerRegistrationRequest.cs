namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents the data required to register a new customer account.
    /// </summary>
    public class CustomerRegisterRequest
    {
        /// <summary>
        /// Gets or sets the email address for the new customer account.
        /// </summary>
        public string EmailAddress { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password for the new customer account.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password confirmation to validate the password.
        /// </summary>
        public string ConfirmPassword { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the customer's first name.
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the customer's last name.
        /// </summary>
        public string LastName { get; set; } = string.Empty;
    }
}
