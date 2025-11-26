USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Updated:     11/19/2025 - Added token expiration and security improvements
-- Description:	Admin generates a registration token for a vendor (after vendor is added to database)
--              Token expires in 48 hours and invalidates any previous tokens
-- exec GenerateVendorRegistrationToken @VendorID=1
-- =============================================
CREATE PROCEDURE [dbo].[GenerateVendorRegistrationToken]
    @VendorID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if vendor exists and doesn't already have an account
    IF NOT EXISTS (SELECT 1 FROM Vendors WHERE VendorID = @VendorID)
    BEGIN
        SELECT 'Error' AS Status, 'Vendor not found' AS Message;
        RETURN;
    END
    
    IF EXISTS (SELECT 1 FROM Vendors WHERE VendorID = @VendorID AND VendorPassword IS NOT NULL)
    BEGIN
        SELECT 'Error' AS Status, 'Vendor already has an account' AS Message;
        RETURN;
    END
    
    -- Check if there's an existing valid (non-expired) token
    DECLARE @ExistingToken NVARCHAR(50);
    DECLARE @ExistingExpiry DATETIME;
    
    SELECT 
        @ExistingToken = RegistrationToken,
        @ExistingExpiry = RegistrationTokenExpiry
    FROM Vendors
    WHERE VendorID = @VendorID;
    
    -- If there's a valid token, return error - don't expose the token again for security
    IF @ExistingToken IS NOT NULL AND @ExistingExpiry IS NOT NULL AND @ExistingExpiry > GETDATE()
    BEGIN
        SELECT 
            'ExistingToken' AS Status,
            'An active registration token already exists for this vendor. For security purposes, the token cannot be retrieved again. It will expire in ' + CAST(DATEDIFF(HOUR, GETDATE(), @ExistingExpiry) AS NVARCHAR) + ' hours.' AS Message,
            @ExistingExpiry AS TokenExpiry,
            DATEDIFF(HOUR, GETDATE(), @ExistingExpiry) AS HoursUntilExpiry,
            VendorID,
            VendorName,
            VendorContactFName AS FirstName,
            VendorContactLName AS LastName,
            VendorEmail
        FROM Vendors
        WHERE VendorID = @VendorID;
        RETURN;
    END
    
    -- Generate unique registration token
    DECLARE @Token NVARCHAR(50) = NEWID();
    DECLARE @Expiry DATETIME = DATEADD(HOUR, 48, GETDATE()); -- Token expires in 48 hours
    
    -- Store token and expiry in vendor record (invalidates any previous token)
    UPDATE Vendors
    SET RegistrationToken = @Token,
        RegistrationTokenExpiry = @Expiry,
        DateUpdated = GETDATE()
    WHERE VendorID = @VendorID;
    
    -- Return token and vendor info
    SELECT 
        'Success' AS Status,
        @Token AS RegistrationToken,
        @Expiry AS TokenExpiry,
        DATEDIFF(HOUR, GETDATE(), @Expiry) AS HoursUntilExpiry,
        VendorID,
        VendorName,
        VendorContactFName AS FirstName,
        VendorContactLName AS LastName,
        VendorEmail
    FROM Vendors
    WHERE VendorID = @VendorID;
END;
GO
