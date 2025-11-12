USE [MyGuitarShop]
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Description:	Creates an order
-- exec CreateOrder
-- =============================================
CREATE PROCEDURE [dbo].[CreateOrder]
(
    @CustomerID INT,
    @ShippingAddressID INT,
    @BillingAddressID INT,
    @OrderID INT OUTPUT
)
AS
BEGIN
    INSERT INTO Orders (CustomerID, OrderDate, ShipAddressID, BillingAddressID)
    VALUES (@CustomerID, GETDATE(), @ShippingAddressID, @BillingAddressID);

    SET @OrderID = SCOPE_IDENTITY();
END;
