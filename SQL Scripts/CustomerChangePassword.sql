USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/17/2025
-- Description:	Changes customer password with old password verification
-- exec CustomerChangePassword @CustomerID=1, @OldPassword='oldpass', @NewPassword='newpass'
-- =============================================
CREATE PROCEDURE [dbo].[CustomerChangePassword]
    @CustomerID INT,
    @OldPassword NVARCHAR(255),
    @NewPassword NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if old password matches
    IF EXISTS (SELECT 1 FROM Customers 
               WHERE CustomerID = @CustomerID 
               AND Password = @OldPassword 
               AND IsActive = 1)
    BEGIN
        -- Update to new password
        UPDATE Customers
        SET Password = @NewPassword,
            DateUpdated = GETDATE()
        WHERE CustomerID = @CustomerID;
        
        SELECT 'Password changed successfully.' AS Message, 1 AS Success;
    END
    ELSE
    BEGIN
        SELECT 'Current password is incorrect.' AS Message, 0 AS Success;
    END
END;
GO