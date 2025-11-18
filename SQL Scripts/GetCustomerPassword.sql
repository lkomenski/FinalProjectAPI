USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/18/2025
-- Description:	Retrieves customer password hash for verification
-- exec GetCustomerPassword @CustomerID=1
-- =============================================
CREATE OR ALTER PROCEDURE [dbo].[GetCustomerPassword]
    @CustomerID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT CustomerID, Password
    FROM Customers
    WHERE CustomerID = @CustomerID AND IsActive = 1;
END
