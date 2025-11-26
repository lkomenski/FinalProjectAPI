USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Retrieves all GL accounts for vendor dropdown selection
--              Includes only accounts appropriate for vendor expenses/purchases
--              Excludes: Payroll taxes (221, 234, 237-243), Sales/Revenue (300s), 
--                       Equity (280, 290), Interest (620-621), Income Taxes (630-632)
-- exec GetAllGLAccounts
-- =============================================
CREATE PROCEDURE [dbo].[GetAllGLAccounts]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        AccountNo,
        AccountDescription
    FROM GLAccounts
    WHERE AccountNo NOT IN (
        221, -- 401K Employee Contributions
        234, -- Medicare Taxes Payable
        237, -- State Payroll Taxes Payable
        238, -- Employee FICA Taxes Payable
        239, -- Employer FICA Taxes Payable
        241, -- Employer FUTA Taxes Payable
        242, -- Employee SDI Taxes Payable
        243, -- Employer UCI Taxes Payable
        280, -- Capital Stock
        290, -- Retained Earnings
        300, 301, 302, 306, 310, -- Sales/Revenue accounts
        505, 506, 507, 508, -- Payroll tax expense accounts
        620, 621, -- Interest accounts
        630, 631, 632 -- Tax accounts
    )
    ORDER BY AccountDescription;
END
GO
