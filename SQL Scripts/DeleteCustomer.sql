USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/16/2025
-- Description:	Anonymizes customer data while preserving order history (GDPR compliant)
-- exec DeleteCustomer @CustomerID 122
-- =============================================
CREATE PROCEDURE DeleteCustomer
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Anonymize customer personal information
        UPDATE Customers
        SET 
            EmailAddress = 'deleted_user_' + CAST(@CustomerID AS VARCHAR) + '@anonymized.com',
            Password = NULL,
            FirstName = 'Deleted',
            LastName = 'User',
            IsActive = 0,
            ResetToken = NULL,
            ShippingAddressID = NULL,
            BillingAddressID = NULL,
            DateUpdated = GETDATE()
        WHERE CustomerID = @CustomerID;
        
        -- Anonymize all addresses for this customer
        UPDATE Addresses
        SET 
            Line1 = '[REDACTED]',
            Line2 = NULL,
            City = '[REDACTED]',
            State = 'XX',
            ZipCode = '00000',
            Phone = NULL,
            Disabled = 1
        WHERE CustomerID = @CustomerID;
        
        -- Orders and OrderItems remain intact for business analytics
        -- but are now associated with an anonymized customer
        
        COMMIT TRANSACTION;
        
        SELECT 'Deleted' AS Status, 'Customer data anonymized, order history preserved' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        SELECT 'Error' AS Status, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
