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
    SELECT 
        i.InvoiceID,
        i.VendorID,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.InvoiceTotal,
        i.PaymentTotal,
        i.CreditTotal,
        i.InvoiceDueDate,
        i.PaymentDate,
        t.TermsDescription,

        v.VendorName,
        v.VendorContactFName,
        v.VendorContactLName,
        v.VendorCity,
        v.VendorState,
        v.VendorPhone
    FROM Invoices i
    INNER JOIN Vendors v ON i.VendorID = v.VendorID
    LEFT JOIN Terms t ON i.TermsID = t.TermsID
    WHERE i.InvoiceID = @InvoiceID;
END
