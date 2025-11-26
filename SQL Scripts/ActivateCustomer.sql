USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Activates a customer and enables their addresses
-- exec ActivateCustomer @CustomerID = 122
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[ActivateCustomer]
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Activate the customer
    UPDATE Customers
    SET IsActive = 1,
        DateUpdated = GETDATE()
    WHERE CustomerID = @CustomerID;

    -- Enable all addresses associated with this customer
    UPDATE Addresses
    SET Disabled = 0
    WHERE CustomerID = @CustomerID;

    SELECT 'Activated' AS Status;
END;
GO
