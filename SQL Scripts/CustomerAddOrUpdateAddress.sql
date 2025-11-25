USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/17/2025
-- Description:	Adds or updates customer address and links it to customer.
--              If billing address matches shipping, reuses the same AddressID.
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
    DECLARE @ShippingAddressID INT;
    DECLARE @BillingAddressID INT;
    
    -- Get both current address IDs
    SELECT @ShippingAddressID = ShippingAddressID, 
           @BillingAddressID = BillingAddressID 
    FROM Customers 
    WHERE CustomerID = @CustomerID;
    
    -- Determine which address ID we're working with
    IF @AddressType = 'shipping'
        SET @ExistingAddressID = @ShippingAddressID;
    ELSE IF @AddressType = 'billing'
        SET @ExistingAddressID = @BillingAddressID;
    ELSE
    BEGIN
        SELECT 'Invalid address type. Use "shipping" or "billing".' AS ErrorMessage, 0 AS Success;
        RETURN;
    END

    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- If updating billing address, check if it matches shipping address
        IF @AddressType = 'billing' AND @ShippingAddressID IS NOT NULL
        BEGIN
            DECLARE @ShippingLine1 NVARCHAR(60), @ShippingLine2 NVARCHAR(60),
                    @ShippingCity NVARCHAR(40), @ShippingState NVARCHAR(2),
                    @ShippingZipCode NVARCHAR(10);
            
            SELECT @ShippingLine1 = Line1, @ShippingLine2 = Line2,
                   @ShippingCity = City, @ShippingState = State,
                   @ShippingZipCode = ZipCode
            FROM Addresses
            WHERE AddressID = @ShippingAddressID AND CustomerID = @CustomerID;
            
            -- Check if billing matches shipping (ignoring phone, which can differ)
            IF (@Line1 = @ShippingLine1 OR (@Line1 IS NULL AND @ShippingLine1 IS NULL))
               AND (@Line2 = @ShippingLine2 OR (@Line2 IS NULL AND @ShippingLine2 IS NULL))
               AND (@City = @ShippingCity OR (@City IS NULL AND @ShippingCity IS NULL))
               AND (@State = @ShippingState OR (@State IS NULL AND @ShippingState IS NULL))
               AND (@ZipCode = @ShippingZipCode OR (@ZipCode IS NULL AND @ShippingZipCode IS NULL))
            BEGIN
                -- Billing matches shipping, reuse the same address
                IF @BillingAddressID != @ShippingAddressID
                BEGIN
                    -- If there was a different billing address, we can optionally disable it
                    IF @BillingAddressID IS NOT NULL
                    BEGIN
                        UPDATE Addresses SET Disabled = 1 
                        WHERE AddressID = @BillingAddressID AND CustomerID = @CustomerID;
                    END
                    
                    -- Point billing to the same address as shipping
                    UPDATE Customers 
                    SET BillingAddressID = @ShippingAddressID,
                        DateUpdated = GETDATE()
                    WHERE CustomerID = @CustomerID;
                    
                    SELECT 
                        @ShippingAddressID AS AddressID,
                        @AddressType AS AddressType,
                        'Billing address set to match shipping address' AS Message,
                        1 AS Success;
                    
                    COMMIT TRANSACTION;
                    RETURN;
                END
                ELSE
                BEGIN
                    -- Already using the same address, nothing to do
                    SELECT 
                        @ShippingAddressID AS AddressID,
                        @AddressType AS AddressType,
                        'Billing and shipping already use the same address' AS Message,
                        1 AS Success;
                    
                    COMMIT TRANSACTION;
                    RETURN;
                END
            END
        END
        
        -- If address exists, update it; otherwise, create new one
        IF @ExistingAddressID IS NOT NULL
        BEGIN
            -- Check if this address is shared between shipping and billing
            DECLARE @IsSharedAddress BIT = 0;
            IF @ShippingAddressID = @BillingAddressID AND @ExistingAddressID = @ShippingAddressID
                SET @IsSharedAddress = 1;
            
            -- If it's a shared address and we're changing it, create a new address
            IF @IsSharedAddress = 1 AND @AddressType = 'billing'
            BEGIN
                -- Create new billing address since it's diverging from shipping
                INSERT INTO Addresses (CustomerID, Line1, Line2, City, State, ZipCode, Phone, Disabled)
                VALUES (@CustomerID, @Line1, @Line2, @City, @State, @ZipCode, @Phone, 0);
                
                SET @AddressID = SCOPE_IDENTITY();
                
                UPDATE Customers SET BillingAddressID = @AddressID WHERE CustomerID = @CustomerID;
            END
            ELSE
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