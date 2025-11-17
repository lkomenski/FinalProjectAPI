namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Data transfer object for resetting a password with a valid token.
    /// </summary>
    public class ResetPasswordDto
    {
        /// <summary>
        /// Gets or sets the email address of the user.
        /// </summary>
        public string EmailAddress { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password reset token.
        /// </summary>
        public string ResetToken { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the new password.
        /// </summary>
        public string NewPassword { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the password confirmation.
        /// </summary>
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
