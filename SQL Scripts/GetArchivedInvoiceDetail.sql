USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Gets archived invoice detail by invoice ID
-- exec GetArchivedInvoiceDetail @InvoiceID = 5
-- =============================================
CREATE PROCEDURE [dbo].[GetArchivedInvoiceDetail]
    @InvoiceID INT
AS
BEGIN
    -- Get invoice header with vendor and terms info
    SELECT 
        ia.InvoiceID,
        ia.VendorID,
        ia.InvoiceNumber,
        ia.InvoiceDate,
        ia.InvoiceTotal,
        ia.PaymentTotal,
        ia.CreditTotal,
        ia.TermsID,
        ia.InvoiceDueDate,
        ia.PaymentDate,
        t.TermsDescription,
        t.TermsDueDays,
        v.VendorName,
        v.VendorContactFName,
        v.VendorContactLName,
        v.VendorAddress1,
        v.VendorAddress2,
        v.VendorCity,
        v.VendorState,
        v.VendorZipCode,
        v.VendorPhone,
        v.VendorEmail
    FROM InvoiceArchive ia
    INNER JOIN Vendors v ON ia.VendorID = v.VendorID
    LEFT JOIN Terms t ON ia.TermsID = t.TermsID
    WHERE ia.InvoiceID = @InvoiceID;
END
GO
