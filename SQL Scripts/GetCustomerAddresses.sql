USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/17/2025
-- Description:	Gets customer addresses for display/editing
-- exec GetCustomerAddresses @CustomerID=1
-- =============================================
CREATE PROCEDURE [dbo].[GetCustomerAddresses]
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Get customer info with address IDs
    SELECT 
        c.CustomerID,
        c.FirstName,
        c.LastName,
        c.EmailAddress,
        c.ShippingAddressID,
        c.BillingAddressID,
        -- Shipping address details
        s.AddressID AS ShippingAddressID,
        s.Line1 AS ShippingLine1,
        s.Line2 AS ShippingLine2,
        s.City AS ShippingCity,
        s.State AS ShippingState,
        s.ZipCode AS ShippingZipCode,
        s.Phone AS ShippingPhone,
        -- Billing address details
        b.AddressID AS BillingAddressID,
        b.Line1 AS BillingLine1,
        b.Line2 AS BillingLine2,
        b.City AS BillingCity,
        b.State AS BillingState,
        b.ZipCode AS BillingZipCode,
        b.Phone AS BillingPhone
    FROM Customers c
        LEFT JOIN Addresses s ON c.ShippingAddressID = s.AddressID
        LEFT JOIN Addresses b ON c.BillingAddressID = b.AddressID
    WHERE c.CustomerID = @CustomerID
        AND c.IsActive = 1;

END
GO