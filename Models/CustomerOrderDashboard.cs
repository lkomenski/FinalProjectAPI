namespace FinalProjectAPI.Models
{
    public class CustomerDashboardModel
    {
        public int CustomerID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmailAddress { get; set; }

        // Order Summary
        public List<CustomerOrderSummary>? Orders { get; set; }
    }

    public class CustomerOrderSummary
    {
        public int OrderID { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal ShipAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public DateTime? ShipDate { get; set; }
        public decimal OrderTotal { get; set; }

        // Nested list of products
        public List<CustomerOrderItem>? Items { get; set; }
    }

    public class CustomerOrderItem
    {
        public int ProductID { get; set; }
        public string? ProductName { get; set; }
        public decimal ItemPrice { get; set; }
        public int Quantity { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal LineTotal => (ItemPrice - DiscountAmount) * Quantity;
    }
}
