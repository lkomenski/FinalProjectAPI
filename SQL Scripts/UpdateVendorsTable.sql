USE [AP]
GO

ALTER TABLE [dbo].[Vendors]
ADD 
    [IsActive] [bit] NULL CONSTRAINT DF_Vendors_IsActive DEFAULT ((1)), -- Add IsActive column with default constraint
    --[DateUpdated] [datetime] NULL; -- Add DateUpdated column
GO


UPDATE [dbo].[Vendors]
   SET [IsActive] = 1
GO