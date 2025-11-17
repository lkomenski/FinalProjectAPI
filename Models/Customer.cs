namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a customer in the MyGuitarShop system.
    /// </summary>
    public class Customer
    {
        /// <summary>
        /// Gets or sets the unique identifier for the customer.
        /// </summary>
        public int CustomerID { get; set; }

        /// <summary>
        /// Gets or sets the customer's email address used for login.
        /// </summary>
        public string EmailAddress { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the customer's password for authentication.
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the customer's first name.
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the customer's last name.
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the identifier for the customer's shipping address.
        /// </summary>
        public int? ShippingAddressID { get; set; }

        /// <summary>
        /// Gets or sets the identifier for the customer's billing address.
        /// </summary>
        public int? BillingAddressID { get; set; }
    }
}
