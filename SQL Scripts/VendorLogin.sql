USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/11/2025
-- Description:	Vendor login with email and password
-- exec VendorLogin
-- =============================================
CREATE PROCEDURE [dbo].[VendorLogin]
    @EmailAddress NVARCHAR(255),
    @Password NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        VendorID,
        VendorContactFName,
        VendorContactLName,
        VendorCity,
        VendorState
    FROM Vendors
    WHERE VendorEmail = @EmailAddress 
      AND VendorPassword = @Password
      AND IsActive = 1;
END;
