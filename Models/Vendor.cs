namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a vendor in the AP system.
    /// </summary>
    public class Vendor
    {
        /// <summary>
        /// Gets or sets the unique identifier for the vendor.
        /// </summary>
        public int VendorID { get; set; }

        /// <summary>
        /// Gets or sets the name of the vendor company.
        /// </summary>
        public string VendorName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the primary address line for the vendor.
        /// </summary>
        public string VendorAddress1 { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the secondary address line for the vendor (optional).
        /// </summary>
        public string? VendorAddress2 { get; set; }

        /// <summary>
        /// Gets or sets the city where the vendor is located.
        /// </summary>
        public string VendorCity { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the state where the vendor is located.
        /// </summary>
        public string VendorState { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the ZIP code of the vendor's location.
        /// </summary>
        public string VendorZipCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the phone number for the vendor.
        /// </summary>
        public string VendorPhone { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the last name of the vendor's contact person.
        /// </summary>
        public string VendorContactLName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the first name of the vendor's contact person.
        /// </summary>
        public string VendorContactFName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the default terms identifier for this vendor.
        /// </summary>
        public int DefaultTermsID { get; set; }

        /// <summary>
        /// Gets or sets the default account number for this vendor.
        /// </summary>
        public int DefaultAccountNo { get; set; }

        /// <summary>
        /// Gets or sets the date when the vendor information was last updated.
        /// </summary>
        public DateTime? DateUpdated { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether this vendor is currently active.
        /// </summary>
        public bool IsActive { get; set; }
    }
}
