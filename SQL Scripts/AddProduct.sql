USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Adds a new product
-- exec AddProduct @CategoryID=1, @ProductCode='GTR001', @ProductName='Acoustic Guitar', @Description='A high-quality acoustic guitar.', @ListPrice=199.99, @DiscountPercent=10.00, @ImageURL='http://example.com/images/gtr001.jpg'
-- =============================================

CREATE PROCEDURE [dbo].[AddProduct]
    @CategoryID INT,
    @ProductCode VARCHAR(10),
    @ProductName VARCHAR(255),
    @Description TEXT,
    @ListPrice MONEY,
    @DiscountPercent MONEY,
    @ImageURL NVARCHAR(500) = NULL
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
        ,1
        ,GETDATE()
        ,GETDATE())

    SELECT 
        ProductID,
        CategoryID,
        ProductCode,
        ProductName,
        Description,
        ListPrice,
        DiscountPercent,
        ImageURL,
        IsActive,
        DateAdded,
        DateUpdated
    FROM [dbo].[Products]
    WHERE ProductID = SCOPE_IDENTITY()
END
