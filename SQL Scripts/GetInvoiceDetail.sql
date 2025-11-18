USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Gets invoice detail by invoice ID
-- exec GetInvoiceDetail @InvoiceID 124
-- =============================================
CREATE PROCEDURE [dbo].[GetInvoiceDetail]
    @InvoiceID INT
AS
BEGIN
    -- Get invoice header with vendor and terms info
    SELECT 
        i.InvoiceID,
        i.VendorID,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.InvoiceTotal,
        i.PaymentTotal,
        i.CreditTotal,
        i.TermsID,
        i.InvoiceDueDate,
        i.PaymentDate,
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
    FROM Invoices i
    INNER JOIN Vendors v ON i.VendorID = v.VendorID
    LEFT JOIN Terms t ON i.TermsID = t.TermsID
    WHERE i.InvoiceID = @InvoiceID;

    -- Get invoice line items with GL account descriptions
    SELECT 
        ili.InvoiceID,
        ili.InvoiceSequence,
        ili.AccountNo,
        ili.InvoiceLineItemAmount,
        ili.InvoiceLineItemDescription,
        gla.AccountDescription
    FROM InvoiceLineItems ili
    LEFT JOIN GLAccounts gla ON ili.AccountNo = gla.AccountNo
    WHERE ili.InvoiceID = @InvoiceID
    ORDER BY ili.InvoiceSequence;
END
