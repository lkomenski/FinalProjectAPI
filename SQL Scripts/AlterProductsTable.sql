USE [MyGuitarShop]
GO
-- =============================================
-- Author:		Leena Komenski
-- Updated: 11/19/2025 - Added QuantityOnHand column
-- Description:	Alters Products table to add necessary columns
-- =============================================

-- Add IsActive column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'IsActive')
BEGIN
    PRINT 'Adding IsActive column...';
    ALTER TABLE [dbo].[Products] ADD [IsActive] [bit] NULL CONSTRAINT DF_Products_IsActive DEFAULT ((1));
END

-- Add DateCreated column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'DateCreated')
BEGIN
    PRINT 'Adding DateCreated column...';
    ALTER TABLE [dbo].[Products] ADD [DateCreated] [datetime] NULL;
END

-- Add DateAdded column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'DateAdded')
BEGIN
    PRINT 'Adding DateAdded column...';
    ALTER TABLE [dbo].[Products] ADD [DateAdded] [datetime] NULL;
END

-- Add ImageURL column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'ImageURL')
BEGIN
    PRINT 'Adding ImageURL column...';
    ALTER TABLE [dbo].[Products] ADD ImageURL NVARCHAR(500) NULL;
    PRINT 'ImageURL column added successfully.';
END
ELSE
    PRINT 'ImageURL column already exists.';

-- Add QuantityOnHand column if it doesn't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Products' AND COLUMN_NAME = 'QuantityOnHand')
BEGIN
    PRINT 'Adding QuantityOnHand column...';
    ALTER TABLE [dbo].[Products] ADD QuantityOnHand INT NULL;
    PRINT 'QuantityOnHand column added successfully.';
END
ELSE
    PRINT 'QuantityOnHand column already exists.';

GO

-- Set IsActive to 1 for all existing products
UPDATE [dbo].[Products]
SET [IsActive] = 1
WHERE [IsActive] IS NULL;

-- Set default QuantityOnHand to 1 for any NULL values
UPDATE [dbo].[Products]
SET QuantityOnHand = 1
WHERE QuantityOnHand IS NULL;

-- Update QuantityOnHand to 10 for all products
UPDATE [dbo].[Products]
SET QuantityOnHand = 10;
GO

UPDATE Products
SET ImageURL = '/images/guitars/strat.jpg'
WHERE ProductID = 1;

UPDATE Products
SET ImageURL = '/images/guitars/les_paul.jpg'
WHERE ProductID = 2;

UPDATE Products
SET ImageURL = '/images/guitars/sg.jpg'
WHERE ProductID = 3;

UPDATE Products
SET ImageURL = '/images/guitars/fg700s.jpg'
WHERE ProductID = 4;

UPDATE Products
SET ImageURL = '/images/guitars/washburn.jpg'
WHERE ProductID = 5;

UPDATE Products
SET ImageURL = '/images/guitars/rodriguez.jpg'
WHERE ProductID = 6;

UPDATE Products
SET ImageURL = '/images/basses/precision.jpg'
WHERE ProductID = 7;

UPDATE Products
SET ImageURL = '/images/basses/hofner.jpg'
WHERE ProductID = 8;

UPDATE Products
SET ImageURL = '/images/drums/ludwig.jpg'
WHERE ProductID = 9;

UPDATE Products
SET ImageURL = '/images/drums/tama.jpg'
WHERE ProductID = 10;

GO

-- =============================================
-- Create Auto-Deactivation Trigger
-- Automatically deactivates products when QuantityOnHand reaches 0
-- and reactivates when QuantityOnHand increases
-- =============================================

-- Drop trigger if it exists
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_Products_AutoDeactivate')
    DROP TRIGGER trg_Products_AutoDeactivate;
GO

CREATE TRIGGER trg_Products_AutoDeactivate
ON Products
AFTER UPDATE, INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Only auto-deactivate when QuantityOnHand changes to 0
    -- Don't interfere if user manually changes IsActive
    IF UPDATE(QuantityOnHand) AND NOT UPDATE(IsActive)
    BEGIN
        -- Auto-deactivate when QuantityOnHand = 0
        UPDATE p
        SET IsActive = 0,
            DateUpdated = GETDATE()
        FROM Products p
        INNER JOIN inserted i ON p.ProductID = i.ProductID
        WHERE i.QuantityOnHand = 0 AND p.IsActive = 1;
        
        -- Auto-reactivate when QuantityOnHand > 0 (only if it was auto-deactivated)
        UPDATE p
        SET IsActive = 1,
            DateUpdated = GETDATE()
        FROM Products p
        INNER JOIN inserted i ON p.ProductID = i.ProductID
        WHERE i.QuantityOnHand > 0 AND p.IsActive = 0;
    END
END
GO

