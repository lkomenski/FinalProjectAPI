USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Retrieves all invoices with vendor and terms information
-- exec GetAllInvoices
-- =============================================
CREATE PROCEDURE [dbo].[GetAllInvoices]
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
        i.TermsID,
        i.InvoiceDueDate,
        i.PaymentDate,
        t.TermsDescription,
        t.TermsDueDays
    FROM Invoices i
    LEFT JOIN Vendors v ON i.VendorID = v.VendorID
    LEFT JOIN Terms t ON i.TermsID = t.TermsID
    ORDER BY i.InvoiceDate DESC;
END
GO
