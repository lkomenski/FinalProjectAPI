USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Gets an invoice by ID
-- exec GetInvoiceByID @InvoiceID 8
-- =============================================
CREATE PROCEDURE [dbo].[GetInvoiceByID]
    @InvoiceID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        i.InvoiceID,
        i.InvoiceNumber,
        i.InvoiceDate,
        i.InvoiceTotal,
        il.InvoiceSequence,
        il.AccountNo,
        g.AccountDescription,
        il.InvoiceLineItemAmount,
        il.InvoiceLineItemDescription
    FROM Invoices i
    INNER JOIN InvoiceLineItems il ON i.InvoiceID = il.InvoiceID
    INNER JOIN GLAccounts g ON il.AccountNo = g.AccountNo
    WHERE i.InvoiceID = @InvoiceID;
END;
