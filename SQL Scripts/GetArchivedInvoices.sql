USE AP;
GO

-- Drop the procedure if it already exists
IF OBJECT_ID('GetArchivedInvoices', 'P') IS NOT NULL
    DROP PROCEDURE GetArchivedInvoices;
GO

-- Create the GetArchivedInvoices stored procedure
CREATE PROCEDURE GetArchivedInvoices
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        ia.InvoiceID,
        ia.VendorID,
        v.VendorName,
        ia.InvoiceNumber,
        ia.InvoiceDate,
        ia.InvoiceTotal,
        ia.PaymentTotal,
        ia.CreditTotal,
        ia.TermsID,
        ia.InvoiceDueDate,
        ia.PaymentDate,
        t.TermsDescription,
        t.TermsDueDays
    FROM InvoiceArchive ia
    LEFT JOIN Vendors v ON ia.VendorID = v.VendorID
    LEFT JOIN Terms t ON ia.TermsID = t.TermsID
    ORDER BY ia.InvoiceDate DESC;
END;
GO
