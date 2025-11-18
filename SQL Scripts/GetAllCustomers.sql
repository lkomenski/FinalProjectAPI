USE MyGuitarShop;
GO

IF OBJECT_ID('GetAllCustomers', 'P') IS NOT NULL
    DROP PROCEDURE GetAllCustomers;
GO

CREATE PROCEDURE GetAllCustomers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CustomerID,
        FirstName,
        LastName,
        EmailAddress,
        IsActive
    FROM Customers
    ORDER BY LastName, FirstName;
END;
GO
