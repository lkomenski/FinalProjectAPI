namespace FinalProjectAPI.Models
{
    /// <summary>
    /// Represents the dashboard data for a vendor including invoices and contact information.
    /// </summary>
    public class VendorDashboardModel
    {
        /// <summary>
        /// Gets or sets the unique identifier for the vendor.
        /// </summary>
        public int VendorID { get; set; }

        /// <summary>
        /// Gets or sets the vendor's name.
        /// </summary>
        public string? VendorName { get; set; }

        /// <summary>
        /// Gets or sets the vendor contact's first name.
        /// </summary>
        public string? VendorContactFirstName { get; set; }

        /// <summary>
        /// Gets or sets the vendor contact's last name.
        /// </summary>
        public string? VendorContactLastName { get; set; }

        /// <summary>
        /// Gets or sets the vendor's phone number.
        /// </summary>
        public string? VendorPhone { get; set; }

        /// <summary>
        /// Gets or sets the vendor's city.
        /// </summary>
        public string? VendorCity { get; set; }

        /// <summary>
        /// Gets or sets the vendor's state.
        /// </summary>
        public string? VendorState { get; set; }

        /// <summary>
        /// Gets or sets the last update date for the vendor information.
        /// </summary>
        public DateTime? DateUpdated { get; set; }

        /// <summary>
        /// Gets or sets the list of invoices associated with the vendor.
        /// </summary>
        public List<VendorInvoiceSummary>? Invoices { get; set; }
    }

    /// <summary>
    /// Represents a summary of an invoice for the vendor dashboard.
    /// </summary>
    public class VendorInvoiceSummary
    {
        /// <summary>
        /// Gets or sets the unique identifier for the invoice.
        /// </summary>
        public int InvoiceID { get; set; }

        /// <summary>
        /// Gets or sets the invoice number.
        /// </summary>
        public string? InvoiceNumber { get; set; }

        /// <summary>
        /// Gets or sets the date the invoice was created.
        /// </summary>
        public DateTime InvoiceDate { get; set; }

        /// <summary>
        /// Gets or sets the total amount of the invoice.
        /// </summary>
        public decimal InvoiceTotal { get; set; }

        /// <summary>
        /// Gets or sets the total amount paid on the invoice.
        /// </summary>
        public decimal PaymentTotal { get; set; }

        /// <summary>
        /// Gets or sets the total credit applied to the invoice.
        /// </summary>
        public decimal CreditTotal { get; set; }

        /// <summary>
        /// Gets or sets the due date for the invoice.
        /// </summary>
        public DateTime? InvoiceDueDate { get; set; }

        /// <summary>
        /// Gets or sets the date the invoice was paid.
        /// </summary>
        public DateTime? PaymentDate { get; set; }

        /// <summary>
        /// Gets or sets the payment terms description.
        /// </summary>
        public string? TermsDescription { get; set; }

        /// <summary>
        /// Gets or sets the list of line items on the invoice.
        /// </summary>
        public List<InvoiceLineItem>? LineItems { get; set; }
    }

    /// <summary>
    /// Represents a line item on an invoice.
    /// </summary>
    public class InvoiceLineItem
    {
        /// <summary>
        /// Gets or sets the sequence number of the line item on the invoice.
        /// </summary>
        public int InvoiceSequence { get; set; }

        /// <summary>
        /// Gets or sets the account number associated with the line item.
        /// </summary>
        public string? AccountNo { get; set; }

        /// <summary>
        /// Gets or sets the description of the account.
        /// </summary>
        public string? AccountDescription { get; set; }

        /// <summary>
        /// Gets or sets the amount for this line item.
        /// </summary>
        public decimal InvoiceLineItemAmount { get; set; }

        /// <summary>
        /// Gets or sets the description of the line item.
        /// </summary>
        public string? InvoiceLineItemDescription { get; set; }
    }
}
