USE [AP]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/25/2025
-- Description:	Retrieves all payment terms for vendor dropdown selection
-- exec GetAllTerms
-- =============================================
CREATE PROCEDURE [dbo].[GetAllTerms]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        TermsID,
        TermsDescription,
        TermsDueDays
    FROM Terms
    ORDER BY TermsDescription;
END
GO
