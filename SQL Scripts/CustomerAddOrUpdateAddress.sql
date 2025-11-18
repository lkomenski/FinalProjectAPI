USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/17/2025
-- Description:	Adds or updates customer address and links it to customer
-- exec CustomerAddOrUpdateAddress @CustomerID=1, @AddressType='shipping', @Line1='123 Main St', @City='Anytown', @State='CA', @ZipCode='12345'
-- =============================================
CREATE PROCEDURE [dbo].[CustomerAddOrUpdateAddress]
    @CustomerID INT,
    @AddressType NVARCHAR(20), -- 'shipping' or 'billing'
    @Line1 NVARCHAR(60),
    @Line2 NVARCHAR(60) = NULL,
    @City NVARCHAR(40),
    @State NVARCHAR(2),
    @ZipCode NVARCHAR(10),
    @Phone NVARCHAR(12) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @AddressID INT;
    DECLARE @ExistingAddressID INT;
    
    -- Get the current address ID for the specified type
    IF @AddressType = 'shipping'
        SELECT @ExistingAddressID = ShippingAddressID FROM Customers WHERE CustomerID = @CustomerID;
    ELSE IF @AddressType = 'billing'
        SELECT @ExistingAddressID = BillingAddressID FROM Customers WHERE CustomerID = @CustomerID;
    ELSE
    BEGIN
        SELECT 'Invalid address type. Use "shipping" or "billing".' AS ErrorMessage, 0 AS Success;
        RETURN;
    END

    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- If address exists, update it; otherwise, create new one
        IF @ExistingAddressID IS NOT NULL
        BEGIN
            -- Fetch existing values first
            DECLARE @ExistingLine1 NVARCHAR(60), @ExistingLine2 NVARCHAR(60), 
                    @ExistingCity NVARCHAR(40), @ExistingState NVARCHAR(2),
                    @ExistingZipCode NVARCHAR(10), @ExistingPhone NVARCHAR(12);
            
            SELECT @ExistingLine1 = Line1, @ExistingLine2 = Line2, 
                   @ExistingCity = City, @ExistingState = State,
                   @ExistingZipCode = ZipCode, @ExistingPhone = Phone
            FROM Addresses
            WHERE AddressID = @ExistingAddressID AND CustomerID = @CustomerID;
            
            -- Use provided values, or fall back to existing values
            SET @Line1 = ISNULL(NULLIF(@Line1, ''), @ExistingLine1);
            SET @Line2 = ISNULL(NULLIF(@Line2, ''), @ExistingLine2);
            SET @City = ISNULL(NULLIF(@City, ''), @ExistingCity);
            SET @State = ISNULL(NULLIF(@State, ''), @ExistingState);
            SET @ZipCode = ISNULL(NULLIF(@ZipCode, ''), @ExistingZipCode);
            SET @Phone = ISNULL(NULLIF(@Phone, ''), @ExistingPhone);
            
            -- Update existing address
            UPDATE Addresses 
            SET Line1 = @Line1,
                Line2 = @Line2,
                City = @City,
                State = @State,
                ZipCode = @ZipCode,
                Phone = @Phone,
                Disabled = 0
            WHERE AddressID = @ExistingAddressID AND CustomerID = @CustomerID;
            
            SET @AddressID = @ExistingAddressID;
        END
        ELSE
        BEGIN
            -- Create new address
            INSERT INTO Addresses (CustomerID, Line1, Line2, City, State, ZipCode, Phone, Disabled)
            VALUES (@CustomerID, @Line1, @Line2, @City, @State, @ZipCode, @Phone, 0);
            
            SET @AddressID = SCOPE_IDENTITY();
            
            -- Link the new address to the customer
            IF @AddressType = 'shipping'
                UPDATE Customers SET ShippingAddressID = @AddressID WHERE CustomerID = @CustomerID;
            ELSE
                UPDATE Customers SET BillingAddressID = @AddressID WHERE CustomerID = @CustomerID;
        END

        -- Update customer's DateUpdated
        UPDATE Customers SET DateUpdated = GETDATE() WHERE CustomerID = @CustomerID;

        -- Return success
        SELECT 
            @AddressID AS AddressID,
            @AddressType AS AddressType,
            'Address saved successfully' AS Message,
            1 AS Success;

        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        SELECT 
            ERROR_MESSAGE() AS ErrorMessage,
            0 AS Success;
    END CATCH

END
GO