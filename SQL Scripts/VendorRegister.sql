USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Vendor completes registration using token from admin
-- exec VendorRegister @RegistrationToken='abc-123-xyz', @VendorEmail='vendor@example.com', @Password='SecurePass123'
-- =============================================
CREATE PROCEDURE [dbo].[VendorRegister]
    @RegistrationToken NVARCHAR(50),
    @VendorEmail NVARCHAR(255),
    @Password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate token exists and vendor doesn't have password yet
    DECLARE @VendorID INT;
    
    SELECT @VendorID = VendorID
    FROM Vendors
    WHERE RegistrationToken = @RegistrationToken
      AND VendorPassword IS NULL
      AND IsActive = 1;
    
    IF @VendorID IS NULL
    BEGIN
        SELECT 
            'Error' AS Status, 
            'Invalid or expired registration token' AS Message;
        RETURN;
    END
    
    -- Check if email matches vendor record (optional security check)
    IF NOT EXISTS (SELECT 1 FROM Vendors WHERE VendorID = @VendorID AND VendorEmail = @VendorEmail)
    BEGIN
        SELECT 
            'Error' AS Status, 
            'Email does not match vendor record' AS Message;
        RETURN;
    END
    
    -- Check if email is already in use by another vendor
    IF EXISTS (SELECT 1 FROM Vendors WHERE VendorEmail = @VendorEmail AND VendorID != @VendorID AND VendorPassword IS NOT NULL)
    BEGIN
        SELECT 
            'Error' AS Status, 
            'This email is already registered' AS Message;
        RETURN;
    END
    
    -- Set password and clear token (password should already be hashed from C#)
    UPDATE Vendors
    SET VendorPassword = @Password,
        RegistrationToken = NULL,
        DateUpdated = GETDATE()
    WHERE VendorID = @VendorID;
    
    -- Return vendor info for login
    SELECT 
        'Success' AS Status,
        'Account activated successfully' AS Message,
        VendorID,
        VendorContactFName AS FirstName,
        VendorContactLName AS LastName,
        VendorEmail
    FROM Vendors
    WHERE VendorID = @VendorID;
END;
GO
