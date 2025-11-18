USE [AP]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Adds RegistrationToken column to Vendors table for secure vendor registration
-- =============================================

-- Check if column exists before adding
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Vendors' 
    AND COLUMN_NAME = 'RegistrationToken'
)
BEGIN
    ALTER TABLE Vendors
    ADD RegistrationToken NVARCHAR(50) NULL;
    
    PRINT 'RegistrationToken column added successfully';
END
ELSE
BEGIN
    PRINT 'RegistrationToken column already exists';
END
GO
