USE MyGuitarShop
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Gets employee sales dashboard with summary totals and top 5 products
-- exec GetEmployeeDashboard
-- =============================================
CREATE PROCEDURE GetEmployeeDashboard
AS
BEGIN
    SET NOCOUNT ON;

    -- Summary Totals
    SELECT 
        COUNT(DISTINCT o.OrderID) AS TotalOrders,
        COUNT(DISTINCT o.CustomerID) AS TotalCustomers,
        SUM((oi.ItemPrice - oi.DiscountAmount) * oi.Quantity) AS TotalSales,
        SUM(oi.Quantity) AS TotalItemsSold
    FROM Orders o
    INNER JOIN OrderItems oi ON o.OrderID = oi.OrderID;

    -- Top 5 Products
    SELECT TOP 5 
        p.ProductID,
        p.ProductName,
        SUM(oi.Quantity) AS TotalSold,
        SUM((oi.ItemPrice - oi.DiscountAmount) * oi.Quantity) AS TotalRevenue
    FROM OrderItems oi
    INNER JOIN Products p ON oi.ProductID = p.ProductID
    GROUP BY p.ProductID, p.ProductName
    ORDER BY TotalRevenue DESC;
END;
GO
