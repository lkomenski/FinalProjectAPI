USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description: Saves password reset token
-- exec SavePasswordResetToken
-- =============================================
CREATE PROCEDURE [dbo].[SavePasswordResetToken]
    @EmailAddress NVARCHAR(255),
    @ResetToken NVARCHAR(200)
AS
BEGIN
    UPDATE Customers
    SET ResetToken = @ResetToken,
        DateUpdated = GETDATE()
    WHERE EmailAddress = @EmailAddress;
END;
GO