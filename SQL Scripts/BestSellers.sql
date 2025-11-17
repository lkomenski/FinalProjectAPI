USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Description:	Shows best selling products
-- exec BestSellers
-- =============================================
CREATE PROCEDURE [dbo].[BestSellers]
AS
BEGIN
SELECT 
    p.ProductID,
    p.ProductName,
    p.ListPrice,
    p.ImageURL,
    p.IsActive,
    SUM(oi.Quantity) AS TotalSold
FROM Products p
LEFT JOIN OrderItems oi ON p.ProductID = oi.ProductID
GROUP BY p.ProductID, p.ProductName, p.ListPrice, p.ImageURL, p.IsActive
ORDER BY TotalSold DESC
END;