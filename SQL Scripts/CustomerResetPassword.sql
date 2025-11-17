USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Resets customer password
-- exec CustomerResetPassword @EmailAddress='example@example.com', @ResetToken='token123', @NewPassword='newpassword'
-- =============================================
CREATE PROCEDURE [dbo].[CustomerResetPassword]
    @EmailAddress NVARCHAR(255),
    @ResetToken NVARCHAR(200),
    @NewPassword NVARCHAR(255)
AS
BEGIN
    UPDATE Customers
    SET Password = @NewPassword,
        ResetToken = NULL,
        DateUpdated = GETDATE()
    WHERE EmailAddress = @EmailAddress
      AND ResetToken = @ResetToken;
END;
GO

