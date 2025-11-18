namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a request to add or update a customer address.
    /// </summary>
    public class CustomerAddressRequest
    {
        /// <summary>
        /// Gets or sets the customer ID this address belongs to.
        /// </summary>
        public int CustomerID { get; set; }

        /// <summary>
        /// Gets or sets the address type: 'shipping' or 'billing'.
        /// </summary>
        public string AddressType { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the first line of the address.
        /// </summary>
        public string Line1 { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the second line of the address (optional).
        /// </summary>
        public string? Line2 { get; set; }

        /// <summary>
        /// Gets or sets the city.
        /// </summary>
        public string City { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the state or province.
        /// </summary>
        public string State { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the ZIP or postal code.
        /// </summary>
        public string ZipCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the phone number for this address.
        /// </summary>
        public string? Phone { get; set; }
    }
}