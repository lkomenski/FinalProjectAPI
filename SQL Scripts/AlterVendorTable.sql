USE [AP]
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Edits vendor table to include email and password
-- =============================================
ALTER TABLE Vendors
ADD VendorEmail NVARCHAR(255) NULL,
    VendorPassword NVARCHAR(255) NULL,
    [IsActive] [bit] NULL CONSTRAINT DF_Vendors_IsActive DEFAULT ((1)), -- Add IsActive column with default constraint
    [DateUpdated] [datetime] NULL; -- Add DateUpdated column
GO


UPDATE [dbo].[Vendors]
   SET [IsActive] = 1
GO
