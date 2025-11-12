namespace FinalProjectAPI.Models
{
    public class Customer
    {
        public int CustomerID { get; set; }
        public string EmailAddress { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public int? ShippingAddressID { get; set; }
        public int? BillingAddressID { get; set; }
    }
}
