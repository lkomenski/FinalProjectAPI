USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Retrieves all customers for admin management
-- exec GetAllCustomers
-- =============================================
CREATE PROCEDURE [dbo].[GetAllCustomers]
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
END
GO
