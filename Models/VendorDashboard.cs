namespace FinalProjectAPI.Models
{
    public class VendorDashboardModel
    {
        public int VendorID { get; set; }
        public string? VendorName { get; set; }
        public string? VendorContactFirstName { get; set; }
        public string? VendorContactLastName { get; set; }
        public string? VendorPhone { get; set; }
        public string? VendorCity { get; set; }
        public string? VendorState { get; set; }
        public DateTime? DateUpdated { get; set; }

        public List<VendorInvoiceSummary>? Invoices { get; set; }
    }

    public class VendorInvoiceSummary
    {
        public int InvoiceID { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal InvoiceTotal { get; set; }
        public decimal PaymentTotal { get; set; }
        public decimal CreditTotal { get; set; }
        public DateTime? InvoiceDueDate { get; set; }
        public DateTime? PaymentDate { get; set; }
        public string? TermsDescription { get; set; }

        public List<InvoiceLineItem>? LineItems { get; set; }
    }

    public class InvoiceLineItem
    {
        public int InvoiceSequence { get; set; }
        public string? AccountNo { get; set; }
        public string? AccountDescription { get; set; }
        public decimal InvoiceLineItemAmount { get; set; }
        public string? InvoiceLineItemDescription { get; set; }
    }
}
