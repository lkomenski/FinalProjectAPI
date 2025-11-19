USE [MyGuitarShop]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/19/2025
-- Description:	Creates sample orders and order items for testing
--              This populates data for Best Sellers to display
-- =============================================

-- Declare variables for order IDs
DECLARE @OrderID1 INT, @OrderID2 INT, @OrderID3 INT, @OrderID4 INT, @OrderID5 INT;

-- Check if we already have orders - don't duplicate
IF NOT EXISTS (SELECT 1 FROM Orders WHERE CustomerID = 1 AND CAST(OrderDate AS DATE) = CAST(GETDATE() AS DATE))
BEGIN
    -- Order 1: Customer 1 buys Stratocaster (2x) and Ludwig Drums (1x)
    EXEC CreateOrder 
        @CustomerID = 1, 
        @ShipAddressID = 1, 
        @BillingAddressID = 1,
        @ShipAmount = 10.99,
        @TaxAmount = 85.50,
        @CardType = 'Visa',
        @CardNumber = '************1234',
        @CardExpires = '12/26',
        @OrderID = @OrderID1 OUTPUT;
    
    EXEC CreateOrderItem @OrderID = @OrderID1, @ProductID = 1, @ItemPrice = 699.99, @DiscountAmount = 209.99, @Quantity = 2;
    EXEC CreateOrderItem @OrderID = @OrderID1, @ProductID = 9, @ItemPrice = 799.99, @DiscountAmount = 175.99, @Quantity = 1;

    -- Order 2: Customer 2 buys Les Paul (1x) and Precision Bass (1x)
    EXEC CreateOrder 
        @CustomerID = 2, 
        @ShipAddressID = 2, 
        @BillingAddressID = 2,
        @ShipAmount = 10.99,
        @TaxAmount = 120.00,
        @CardType = 'MasterCard',
        @CardNumber = '************5678',
        @CardExpires = '06/27',
        @OrderID = @OrderID2 OUTPUT;
    
    EXEC CreateOrderItem @OrderID = @OrderID2, @ProductID = 2, @ItemPrice = 1199.99, @DiscountAmount = 299.99, @Quantity = 1;
    EXEC CreateOrderItem @OrderID = @OrderID2, @ProductID = 7, @ItemPrice = 799.99, @DiscountAmount = 143.99, @Quantity = 1;

    -- Order 3: Customer 3 buys Stratocaster (1x) and SG (1x)
    EXEC CreateOrder 
        @CustomerID = 3, 
        @ShipAddressID = 3, 
        @BillingAddressID = 3,
        @ShipAmount = 10.99,
        @TaxAmount = 95.00,
        @CardType = 'Amex',
        @CardNumber = '************9012',
        @CardExpires = '03/26',
        @OrderID = @OrderID3 OUTPUT;
    
    EXEC CreateOrderItem @OrderID = @OrderID3, @ProductID = 1, @ItemPrice = 699.99, @DiscountAmount = 209.99, @Quantity = 1;
    EXEC CreateOrderItem @OrderID = @OrderID3, @ProductID = 3, @ItemPrice = 1099.99, @DiscountAmount = 219.99, @Quantity = 1;

    -- Order 4: Customer 1 buys Ludwig Drums (2x)
    EXEC CreateOrder 
        @CustomerID = 1, 
        @ShipAddressID = 1, 
        @BillingAddressID = 1,
        @ShipAmount = 15.99,
        @TaxAmount = 120.00,
        @CardType = 'Visa',
        @CardNumber = '************1234',
        @CardExpires = '12/26',
        @OrderID = @OrderID4 OUTPUT;
    
    EXEC CreateOrderItem @OrderID = @OrderID4, @ProductID = 9, @ItemPrice = 799.99, @DiscountAmount = 175.99, @Quantity = 2;

    -- Order 5: Customer 4 buys FG700S (1x) and Rodriguez (1x)
    EXEC CreateOrder 
        @CustomerID = 4, 
        @ShipAddressID = 4, 
        @BillingAddressID = 4,
        @ShipAmount = 10.99,
        @TaxAmount = 45.00,
        @CardType = 'Discover',
        @CardNumber = '************3456',
        @CardExpires = '09/25',
        @OrderID = @OrderID5 OUTPUT;
    
    EXEC CreateOrderItem @OrderID = @OrderID5, @ProductID = 4, @ItemPrice = 489.99, @DiscountAmount = 73.49, @Quantity = 1;
    EXEC CreateOrderItem @OrderID = @OrderID5, @ProductID = 6, @ItemPrice = 415.00, @DiscountAmount = 49.80, @Quantity = 1;

    PRINT 'Sample orders created successfully!';
END
ELSE
BEGIN
    PRINT 'Sample orders already exist for today. Skipping creation.';
END
GO

-- Show the results
SELECT 
    p.ProductName,
    SUM(oi.Quantity) AS TotalSold
FROM Products p
INNER JOIN OrderItems oi ON p.ProductID = oi.ProductID
GROUP BY p.ProductName
ORDER BY TotalSold DESC;
GO
