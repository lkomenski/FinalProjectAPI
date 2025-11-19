USE [AP]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Updated: 11/18/2025 - Added RegistrationToken column
-- Updated: 11/19/2025 - Added RegistrationTokenExpiry column
-- Description:	Edits vendor table to include email, password, registration token, and token expiry
-- =============================================

-- Add columns if they don't exist
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'VendorEmail')
    ALTER TABLE Vendors ADD VendorEmail NVARCHAR(255) NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'VendorPassword')
    ALTER TABLE Vendors ADD VendorPassword NVARCHAR(255) NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'IsActive')
    ALTER TABLE Vendors ADD [IsActive] [bit] NULL CONSTRAINT DF_Vendors_IsActive DEFAULT ((1));

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'DateUpdated')
    ALTER TABLE Vendors ADD [DateUpdated] [datetime] NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'RegistrationToken')
    ALTER TABLE Vendors ADD RegistrationToken NVARCHAR(50) NULL;

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Vendors' AND COLUMN_NAME = 'RegistrationTokenExpiry')
    ALTER TABLE Vendors ADD RegistrationTokenExpiry DATETIME NULL;

GO

-- Set IsActive to 1 for all existing vendors
UPDATE [dbo].[Vendors]
SET [IsActive] = 1
WHERE [IsActive] IS NULL;
GO
