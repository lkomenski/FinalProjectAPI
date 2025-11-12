USE [MyGuitarShop]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		Leena Komenski
-- Create date: 11/12/2025
-- Description:	Gets all categories
-- exec GetCategories
-- =============================================
CREATE PROCEDURE [dbo].[GetCategories]
AS
BEGIN
    SELECT * FROM Categories ORDER BY CategoryName;
END;
