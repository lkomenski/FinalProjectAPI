namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents a product category in the system.
    /// </summary>
    public class Category
    {
        /// <summary>
        /// Gets or sets the unique identifier for the category.
        /// </summary>
        public int CategoryID { get; set; }

        /// <summary>
        /// Gets or sets the name of the category.
        /// </summary>
        public string? CategoryName { get; set; }
    }
}
