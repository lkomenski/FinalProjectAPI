USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/17/2025
-- Description:	Changes customer password (password verification done in C# with BCrypt)
-- exec CustomerChangePassword @CustomerID=1, @NewPassword='$2a$11$hashedpassword...'
-- =============================================
CREATE PROCEDURE [dbo].[CustomerChangePassword]
    @CustomerID INT,
    @OldPassword NVARCHAR(255), -- Kept for compatibility but not used (verification done in C#)
    @NewPassword NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update to new password (already hashed and verified in C#)
    UPDATE Customers
    SET Password = @NewPassword,
        DateUpdated = GETDATE()
    WHERE CustomerID = @CustomerID AND IsActive = 1;
    
    IF @@ROWCOUNT > 0
        SELECT 'Password changed successfully.' AS Message, 1 AS Success;
    ELSE
        SELECT 'Customer not found or inactive.' AS Message, 0 AS Success;
END;
GO