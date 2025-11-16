namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents the dashboard data for a customer including personal information and order history.
    /// </summary>
    public class CustomerDashboard
    {
        /// <summary>
        /// Gets or sets the unique identifier for the customer.
        /// </summary>
        public int CustomerID { get; set; }

        /// <summary>
        /// Gets or sets the customer's first name.
        /// </summary>
        public string? FirstName { get; set; }

        /// <summary>
        /// Gets or sets the customer's last name.
        /// </summary>
        public string? LastName { get; set; }

        /// <summary>
        /// Gets or sets the customer's email address.
        /// </summary>
        public string? EmailAddress { get; set; }

        /// <summary>
        /// Gets or sets the city for the customer's shipping address.
        /// </summary>
        public string? ShippingCity { get; set; }

        /// <summary>
        /// Gets or sets the state for the customer's shipping address.
        /// </summary>
        public string? ShippingState { get; set; }

        /// <summary>
        /// Gets or sets the ZIP code for the customer's shipping address.
        /// </summary>
        public string? ShippingZip { get; set; }

        /// <summary>
        /// Gets or sets the list of orders placed by the customer.
        /// </summary>
        public List<CustomerOrderSummary> Orders { get; set; } = new();
    }

    /// <summary>
    /// Represents a summary of a customer's order.
    /// </summary>
    public class CustomerOrderSummary
    {
        /// <summary>
        /// Gets or sets the unique identifier for the order.
        /// </summary>
        public int OrderID { get; set; }

        /// <summary>
        /// Gets or sets the date the order was placed.
        /// </summary>
        public DateTime OrderDate { get; set; }

        /// <summary>
        /// Gets or sets the subtotal amount before discounts and taxes.
        /// </summary>
        public decimal Subtotal { get; set; }

        /// <summary>
        /// Gets or sets the total discount amount applied to the order.
        /// </summary>
        public decimal TotalDiscount { get; set; }

        /// <summary>
        /// Gets or sets the tax amount for the order.
        /// </summary>
        public decimal TaxAmount { get; set; }

        /// <summary>
        /// Gets or sets the shipping cost for the order.
        /// </summary>
        public decimal ShipAmount { get; set; }

        /// <summary>
        /// Gets or sets the total amount of the order including all fees and taxes.
        /// </summary>
        public decimal OrderTotal { get; set; }

        /// <summary>
        /// Gets or sets the number of items in the order.
        /// </summary>
        public int ItemsCount { get; set; }
    }
}
