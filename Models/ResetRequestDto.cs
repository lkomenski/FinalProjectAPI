namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Data transfer object for password reset requests.
    /// </summary>
    public class ResetRequestDto
    {
        /// <summary>
        /// Gets or sets the email address of the user requesting a password reset.
        /// </summary>
        public string EmailAddress { get; set; } = string.Empty;
    }
}
