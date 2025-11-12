USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Description:	Deactivates a product
-- exec DeactivateProduct @ProductID 9
-- =============================================

CREATE PROCEDURE [dbo].[DeactivateProduct]
    @ProductID INT
AS
BEGIN
    UPDATE Products
    SET IsActive = 0,
		DateUpdated = GETDATE()
    WHERE ProductID = @ProductID;

    SELECT ProductID, IsActive, DateUpdated 
	FROM Products 
	WHERE ProductID = @ProductID;
END;


