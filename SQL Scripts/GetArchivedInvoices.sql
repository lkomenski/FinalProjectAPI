USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Retrieves all archived invoices with vendor and terms information
-- exec GetArchivedInvoices
-- =============================================
CREATE PROCEDURE [dbo].[GetArchivedInvoices]
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
END
GO
