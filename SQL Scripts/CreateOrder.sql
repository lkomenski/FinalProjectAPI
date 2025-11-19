USE [MyGuitarShop]
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Modified date: 11/19/2025
-- Description:	Creates an order with full order details
-- exec CreateOrder @CustomerID=1, @ShipAddressID=1, @BillingAddressID=1, @ShipAmount=5.99, @TaxAmount=8.50, @CardType='Visa', @CardNumber='************1234', @CardExpires='12/25', @OrderID=@OrderID OUTPUT
-- =============================================
CREATE PROCEDURE [dbo].[CreateOrder]
(
    @CustomerID INT,
    @ShipAddressID INT,
    @BillingAddressID INT,
    @ShipAmount DECIMAL(10,2) = 0,
    @TaxAmount DECIMAL(10,2) = 0,
    @ShipDate DATETIME = NULL,
    @CardType VARCHAR(50) = NULL,
    @CardNumber CHAR(16) = NULL,
    @CardExpires CHAR(7) = NULL,
    @OrderID INT OUTPUT
)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Orders (
        CustomerID, 
        OrderDate, 
        ShipAddressID, 
        BillingAddressID,
        ShipAmount,
        TaxAmount,
        ShipDate,
        CardType,
        CardNumber,
        CardExpires
    )
    VALUES (
        @CustomerID, 
        GETDATE(), 
        @ShipAddressID, 
        @BillingAddressID,
        @ShipAmount,
        @TaxAmount,
        @ShipDate,
        @CardType,
        @CardNumber,
        @CardExpires
    );

    SET @OrderID = SCOPE_IDENTITY();
END;
