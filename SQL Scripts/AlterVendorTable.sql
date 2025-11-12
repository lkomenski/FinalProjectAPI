USE [AP]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Edits vendor table to include email and password
-- =============================================
ALTER TABLE Vendors
ADD VendorEmail NVARCHAR(255) NULL,
    VendorPassword NVARCHAR(255) NULL;
