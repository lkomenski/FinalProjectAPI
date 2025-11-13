namespace FinalProjectAPI.Models
{
    public class Vendor
    {
        public int VendorID { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string VendorAddress1 { get; set; } = string.Empty;
        public string? VendorAddress2 { get; set; } // optional
        public string VendorCity { get; set; } = string.Empty;
        public string VendorState { get; set; } = string.Empty;
        public string VendorZipCode { get; set; } = string.Empty;
        public string VendorPhone { get; set; } = string.Empty;
        public string VendorContactLName { get; set; } = string.Empty;
        public string VendorContactFName { get; set; } = string.Empty;
        public int DefaultTermsID { get; set; }
        public int DefaultAccountNo { get; set; }
        public DateTime? DateUpdated { get; set; }
        public bool IsActive { get; set; }


    }
}
