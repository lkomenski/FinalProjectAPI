USE [MyGuitarShop]
GO
-- =============================================
-- Author:		Leena Komenski
-- Updated: 11/19/2025 - Added QuantityOnHand column
-- Description:	Alters Customers table to add necessary columns
-- =============================================

ALTER TABLE [dbo].[Customers]
ADD 
    [IsActive] [bit] NULL CONSTRAINT DF_Customers_IsActive DEFAULT ((1)), -- Add IsActive column with default constraint
    [DateUpdated] [datetime] NULL; -- Add DateUpdated column
    ADD ResetToken NVARCHAR(200) NULL; --Add reset token
GO


UPDATE [dbo].[Customers]
   SET [IsActive] = 1
GO

UPDATE Customers
    SET ResetToken = @ResetToken
    WHERE EmailAddress = @EmailAddress
GO