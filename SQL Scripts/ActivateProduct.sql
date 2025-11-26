USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Description:	Activates a product
-- exec ActivateProduct @ProductID = 9
-- =============================================

CREATE PROCEDURE [dbo].[ActivateProduct]
    @ProductID INT
AS
BEGIN
    UPDATE Products
    SET IsActive = 1,
	    DateUpdated = GETDATE()
    WHERE ProductID = @ProductID;

    SELECT ProductID, IsActive, DateUpdated 
	FROM Products 
	WHERE ProductID = @ProductID;
END;

