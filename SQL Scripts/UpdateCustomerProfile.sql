USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Updates customer profile information
-- exec UpdateCustomerProfile @CustomerID=1, @FirstName='John', @LastName='Doe', @EmailAddress='john@example.com', @NewPassword=NULL
-- =============================================
CREATE PROCEDURE [dbo].[UpdateCustomerProfile]
    @CustomerID INT,
    @FirstName VARCHAR(50),
    @LastName VARCHAR(50),
    @EmailAddress VARCHAR(255),
    @NewPassword VARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Fetch existing values
    DECLARE @ExistingFirstName VARCHAR(50), @ExistingLastName VARCHAR(50), 
            @ExistingEmailAddress VARCHAR(255);
    
    SELECT @ExistingFirstName = FirstName,
           @ExistingLastName = LastName,
           @ExistingEmailAddress = EmailAddress
    FROM Customers
    WHERE CustomerID = @CustomerID;

    -- Use provided values, or fall back to existing values
    SET @FirstName = ISNULL(NULLIF(@FirstName, ''), @ExistingFirstName);
    SET @LastName = ISNULL(NULLIF(@LastName, ''), @ExistingLastName);
    SET @EmailAddress = ISNULL(NULLIF(@EmailAddress, ''), @ExistingEmailAddress);

    -- Update customer profile
    UPDATE Customers
    SET FirstName = @FirstName,
        LastName = @LastName,
        EmailAddress = @EmailAddress,
        Password = CASE 
            WHEN @NewPassword IS NOT NULL AND @NewPassword <> '' THEN @NewPassword 
            ELSE Password 
        END,
        DateUpdated = GETDATE()
    WHERE CustomerID = @CustomerID;

    -- Return updated customer info
    SELECT 
        CustomerID,
        FirstName,
        LastName,
        EmailAddress,
        DateUpdated
    FROM Customers
    WHERE CustomerID = @CustomerID;
END
GO
