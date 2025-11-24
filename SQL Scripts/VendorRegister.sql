USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Updated:     11/19/2025 - Added token expiry validation and clear expiry on registration
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
    
    -- Validate token exists, vendor doesn't have password yet, and token hasn't expired
    DECLARE @VendorID INT;
    DECLARE @TokenExpiry DATETIME;
    
    SELECT 
        @VendorID = VendorID,
        @TokenExpiry = RegistrationTokenExpiry
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
    
    -- Check if token has expired
    IF @TokenExpiry IS NULL OR @TokenExpiry < GETDATE()
    BEGIN
        SELECT 
            'Error' AS Status, 
            'Registration token has expired. Please contact your administrator for a new token' AS Message;
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
    
    -- Set password and clear token + expiry (password should already be hashed from C#)
    UPDATE Vendors
    SET VendorPassword = @Password,
        RegistrationToken = NULL,
        RegistrationTokenExpiry = NULL,
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
