USE AP;
GO

-- Drop the procedure if it already exists
IF OBJECT_ID('GetAllInvoices', 'P') IS NOT NULL
    DROP PROCEDURE GetAllInvoices;
GO

-- Create the GetAllInvoices stored procedure
CREATE PROCEDURE GetAllInvoices
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.InvoiceID,
        i.VendorID,
        v.VendorName,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.InvoiceTotal,
        i.PaymentTotal,
        i.CreditTotal,
        i.InvoiceDueDate
    FROM Invoices i
    LEFT JOIN Vendors v ON i.VendorID = v.VendorID
    ORDER BY i.InvoiceDate DESC;
END;
GO
