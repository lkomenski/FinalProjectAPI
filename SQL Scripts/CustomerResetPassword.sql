USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Resets customer password using reset token
-- exec CustomerResetPassword @EmailAddress='example@example.com', @ResetToken='token123', @NewPassword='newpassword'
-- =============================================
CREATE PROCEDURE [dbo].[CustomerResetPassword]
    @EmailAddress NVARCHAR(255),
    @ResetToken NVARCHAR(200),
    @NewPassword NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if email and token match an active customer
    IF EXISTS (SELECT 1 FROM Customers 
               WHERE EmailAddress = @EmailAddress 
               AND ResetToken = @ResetToken
               AND ResetToken IS NOT NULL
               AND IsActive = 1)
    BEGIN
        UPDATE Customers
        SET Password = @NewPassword,
            ResetToken = NULL,
            DateUpdated = GETDATE()
        WHERE EmailAddress = @EmailAddress
          AND ResetToken = @ResetToken;
          
        SELECT 'Password reset successfully.' AS Message, 1 AS Success;
    END
    ELSE
    BEGIN
        SELECT 'Invalid or expired reset token.' AS Message, 0 AS Success;
    END
END;
GO

