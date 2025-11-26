USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Modified date: 11/19/2025 - Added QuantityOnHand parameter
-- Description:	Adds a new product
-- exec AddProduct @CategoryID=1, @ProductCode='GTR001', @ProductName='Acoustic Guitar', @Description='A high-quality acoustic guitar.', @ListPrice=199.99, @DiscountPercent=10.00, @ImageURL='http://example.com/images/gtr001.jpg', @QuantityOnHand=10
-- =============================================

CREATE PROCEDURE [dbo].[AddProduct]
    @CategoryID INT,
    @ProductCode VARCHAR(10),
    @ProductName VARCHAR(255),
    @Description TEXT,
    @ListPrice MONEY,
    @DiscountPercent MONEY,
    @ImageURL NVARCHAR(500) = NULL,
    @QuantityOnHand INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO [dbo].[Products]
        ([CategoryID]
        ,[ProductCode]
        ,[ProductName]
        ,[Description]
        ,[ListPrice]
        ,[DiscountPercent]
        ,[ImageURL]
        ,[QuantityOnHand]
        ,[IsActive]
        ,[DateAdded]
        ,[DateUpdated])
    VALUES
        (@CategoryID
        ,@ProductCode
        ,@ProductName
        ,@Description
        ,@ListPrice
        ,@DiscountPercent
        ,@ImageURL
        ,@QuantityOnHand
        ,1
        ,GETDATE()
        ,GETDATE())

    -- Return the newly created product using existing GetProductById procedure
    DECLARE @NewProductID INT = SCOPE_IDENTITY()
    EXEC GetProductById @ProductID = @NewProductID
END
