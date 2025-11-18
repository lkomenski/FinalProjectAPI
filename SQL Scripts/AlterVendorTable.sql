USE [AP]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Updated: 11/18/2025 - Added RegistrationToken column
-- Description:	Edits vendor table to include email, password, and registration token
-- =============================================
ALTER TABLE Vendors
ADD VendorEmail NVARCHAR(255) NULL,
    VendorPassword NVARCHAR(255) NULL,
    [IsActive] [bit] NULL CONSTRAINT DF_Vendors_IsActive DEFAULT ((1)),
    [DateUpdated] [datetime] NULL,
    RegistrationToken NVARCHAR(50) NULL;
GO

UPDATE [dbo].[Vendors]
SET [IsActive] = 1
GO
