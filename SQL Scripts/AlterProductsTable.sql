USE [MyGuitarShop]
GO

ALTER TABLE [dbo].[Products]
ADD 
    [IsActive] [bit] NULL CONSTRAINT DF_Products_IsActive DEFAULT ((1)), -- Add IsActive column with default constraint
    [DateCreated] [datetime] NULL, -- Add DateCreated column
    [DateAdded] [datetime] NULL, -- Add DateAdded column
	ImageURL NVARCHAR(500) NULL; -- Add ImageURL column

GO


UPDATE [dbo].[Products]
   SET [IsActive] = 1
GO

UPDATE Products
SET ImageURL = '/images/guitars/strat.jpg'
WHERE ProductID = 1;

UPDATE Products
SET ImageURL = '/images/guitars/lespaul.jpg'
WHERE ProductID = 2;

UPDATE Products
SET ImageURL = '/images/guitars/sg.jpg'
WHERE ProductID = 3;

UPDATE Products
SET ImageURL = '/images/guitars/fg700s.jpg'
WHERE ProductID = 4;

UPDATE Products
SET ImageURL = '/images/guitars/washburn.jpg'
WHERE ProductID = 5;

UPDATE Products
SET ImageURL = '/images/guitars/rodriguez.jpg'
WHERE ProductID = 6;

UPDATE Products
SET ImageURL = '/images/basses/precision.jpg'
WHERE ProductID = 7;

UPDATE Products
SET ImageURL = '/images/basses/hofner.jpg'
WHERE ProductID = 8;

UPDATE Products
SET ImageURL = '/images/drums/ludwig.jpg'
WHERE ProductID = 9;

UPDATE Products
SET ImageURL = '/images/drums/tama.jpg'
WHERE ProductID = 10;

