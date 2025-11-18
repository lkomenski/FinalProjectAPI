USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Deactivates a customer and disables their addresses
-- exec DeactivateCustomer @CustomerID 122
-- =============================================
CREATE PROCEDURE [dbo].[DeactivateCustomer]
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Deactivate the customer
    UPDATE Customers
    SET IsActive = 0,
        DateUpdated = GETDATE()
    WHERE CustomerID = @CustomerID;

    -- Disable all addresses associated with this customer
    UPDATE Addresses
    SET Disabled = 1
    WHERE CustomerID = @CustomerID;

    SELECT 'Deactivated' AS Status;
END;
GO
