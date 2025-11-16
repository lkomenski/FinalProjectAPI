namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a product in the guitar shop inventory.
    /// </summary>
    public class Product
    {
        /// <summary>
        /// Gets or sets the unique identifier for the product.
        /// </summary>
        public int ProductID { get; set; }

        /// <summary>
        /// Gets or sets the category identifier that this product belongs to.
        /// </summary>
        public int CategoryID { get; set; }

        /// <summary>
        /// Gets or sets the product code/SKU.
        /// </summary>
        public string ProductCode { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the name of the product.
        /// </summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the detailed description of the product.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the list price of the product.
        /// </summary>
        public decimal ListPrice { get; set; }

        /// <summary>
        /// Gets or sets the discount percentage applied to the product.
        /// </summary>
        public decimal DiscountPercent { get; set; }

        /// <summary>
        /// Gets or sets the date when the product was added to the system.
        /// </summary>
        public DateTime DateAdded { get; set; }

        /// <summary>
        /// Gets or sets the date when the product was last updated. Null if never updated.
        /// </summary>
        public DateTime? DateUpdated { get; set; }
    }
}

