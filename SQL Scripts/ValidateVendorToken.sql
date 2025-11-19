USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/19/2025
-- Description:	Validates a vendor registration token
--              Checks if token exists, hasn't expired, and vendor doesn't already have an account
-- exec ValidateVendorToken @Token='YOUR-TOKEN-GUID-HERE'
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[ValidateVendorToken]
    @Token NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @VendorID INT;
    DECLARE @TokenExpiry DATETIME;
    DECLARE @HasPassword BIT;
    
    -- Find vendor with this token
    SELECT 
        @VendorID = VendorID,
        @TokenExpiry = RegistrationTokenExpiry,
        @HasPassword = CASE WHEN VendorPassword IS NOT NULL THEN 1 ELSE 0 END
    FROM Vendors
    WHERE RegistrationToken = @Token;
    
    -- Token doesn't exist
    IF @VendorID IS NULL
    BEGIN
        SELECT 
            'Error' AS Status,
            'Invalid token' AS Message,
            0 AS IsValid;
        RETURN;
    END
    
    -- Token has already been used (vendor has password)
    IF @HasPassword = 1
    BEGIN
        SELECT 
            'Error' AS Status,
            'This token has already been used' AS Message,
            0 AS IsValid;
        RETURN;
    END
    
    -- Token has expired
    IF @TokenExpiry IS NULL OR @TokenExpiry < GETDATE()
    BEGIN
        SELECT 
            'Error' AS Status,
            'Token has expired. Please request a new registration token from your administrator' AS Message,
            0 AS IsValid,
            @TokenExpiry AS ExpiredOn;
        RETURN;
    END
    
    -- Token is valid
    SELECT 
        'Success' AS Status,
        'Token is valid' AS Message,
        1 AS IsValid,
        @VendorID AS VendorID,
        @TokenExpiry AS ExpiresOn,
        DATEDIFF(HOUR, GETDATE(), @TokenExpiry) AS HoursRemaining,
        v.VendorName,
        v.VendorContactFName AS FirstName,
        v.VendorContactLName AS LastName,
        v.VendorEmail
    FROM Vendors v
    WHERE VendorID = @VendorID;
END;
GO
