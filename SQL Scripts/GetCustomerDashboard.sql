USE MyGuitarShop
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Gets customer orders dashboard, with customer info and orders with totals
-- exec GetCustomerDashboard
-- =============================================
CREATE PROCEDURE [dbo].[GetCustomerDashboard]
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Return customer info
    SELECT 
        c.CustomerID,
        c.FirstName,
        c.LastName,
        c.EmailAddress,
        a.City AS ShippingCity,
        a.State AS ShippingState,
        a.ZipCode AS ShippingZip
    FROM Customers c
    LEFT JOIN Addresses a ON c.ShippingAddressID = a.AddressID
    WHERE c.CustomerID = @CustomerID;

    -- Return customer's recent orders with totals
    SELECT 
        o.OrderID,
        o.OrderDate,
        SUM(oi.ItemPrice * oi.Quantity) AS Subtotal,
        SUM(oi.DiscountAmount * oi.Quantity) AS TotalDiscount,
        o.TaxAmount,
        o.ShipAmount,
        (SUM(oi.ItemPrice * oi.Quantity) - SUM(oi.DiscountAmount * oi.Quantity)) + o.TaxAmount + o.ShipAmount AS TotalAmount,
        COUNT(DISTINCT oi.ProductID) AS ItemsCount
    FROM Orders o
    INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID
    WHERE o.CustomerID = @CustomerID
    GROUP BY o.OrderID, o.OrderDate, o.TaxAmount, o.ShipAmount
    ORDER BY o.OrderDate DESC;
END;
GO
