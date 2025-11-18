USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Admin generates a registration token for a vendor (after vendor is added to database)
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
    
    -- Generate unique registration token
    DECLARE @Token NVARCHAR(50) = NEWID();
    
    -- Store token in vendor record (we'll add a RegistrationToken column)
    UPDATE Vendors
    SET RegistrationToken = @Token,
        DateUpdated = GETDATE()
    WHERE VendorID = @VendorID;
    
    -- Return token and vendor info
    SELECT 
        'Success' AS Status,
        @Token AS RegistrationToken,
        VendorID,
        VendorName,
        VendorContactFName AS FirstName,
        VendorContactLName AS LastName,
        VendorEmail
    FROM Vendors
    WHERE VendorID = @VendorID;
END;
GO
