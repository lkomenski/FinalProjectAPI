namespace FinalProjectAPI.Models
{
    public class CustomerDashboard
    {
        public int CustomerID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmailAddress { get; set; }

        // Shipping info
        public string? ShippingCity { get; set; }
        public string? ShippingState { get; set; }
        public string? ShippingZip { get; set; }

        public List<CustomerOrderSummary> Orders { get; set; } = new();
    }

    public class CustomerOrderSummary
    {
        public int OrderID { get; set; }
        public DateTime OrderDate { get; set; }

        public decimal Subtotal { get; set; }
        public decimal TotalDiscount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShipAmount { get; set; }
        public decimal OrderTotal { get; set; }

        public int ItemsCount { get; set; }
    }
}
