USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Deactivates a customer
-- exec DeactivateCustomer @CustomerID 122
-- =============================================
CREATE PROCEDURE [dbo].[DeactivateCustomer]
    @CustomerID INT
AS
BEGIN
    UPDATE Customers
    SET IsActive = 0,
        DateUpdated = GETDATE()
    WHERE CustomerID = @CustomerID;

    SELECT 'Deactivated' AS Status;
END;
GO
