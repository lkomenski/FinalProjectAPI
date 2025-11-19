USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:        Leena Komenski
-- Create date:   11/19/2025
-- Description:   Gets all invoices for a specific vendor
-- exec GetVendorInvoices @VendorID = 122
-- =============================================
CREATE PROCEDURE [dbo].[GetVendorInvoices]
    @VendorID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.InvoiceID,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.InvoiceTotal,
        ISNULL(i.PaymentTotal, 0) AS PaymentTotal,
        ISNULL(i.CreditTotal, 0) AS CreditTotal,
        i.InvoiceDueDate,
        i.PaymentDate,
        t.TermsDescription
    FROM Invoices i
    LEFT JOIN Terms t ON i.TermsID = t.TermsID
    WHERE i.VendorID = @VendorID
    ORDER BY i.InvoiceDate DESC;
END;
GO
