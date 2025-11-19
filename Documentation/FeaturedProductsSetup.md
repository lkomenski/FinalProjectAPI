# Featured Products Setup Guide

## Overview
This guide explains how to set up the featured products functionality that allows administrators to select which products appear as featured on the home page.

## Database Changes Required

### 1. Add IsFeatured Column
Run the SQL script to add the `IsFeatured` column to the Products table:

```bash
SQL Scripts/AddIsFeaturedColumn.sql
```

This script:
- Adds a `IsFeatured BIT NOT NULL DEFAULT 0` column to the Products table
- Sets default value to 0 (not featured) for all existing products
- Includes safety check to prevent errors if column already exists

### 2. Update GetAllProducts Stored Procedure
Run the SQL script to include the `IsFeatured` field in product queries:

```bash
SQL Scripts/GetAllProducts.sql
```

This script updates the stored procedure to return the `IsFeatured` status with each product.

### 3. Create UpdateProductFeaturedStatus Stored Procedure
Run the SQL script to create the stored procedure for toggling featured status:

```bash
SQL Scripts/UpdateProductFeaturedStatus.sql
```

This stored procedure:
- Updates the `IsFeatured` status for a product
- Updates the `DateUpdated` timestamp
- Returns the complete updated product information

## Application Updates

### Backend Changes
1. **Product.cs Model** - Added `IsFeatured` property
2. **ProductsController.cs** - Added:
   - `IsFeatured` mapping in `MapRowToProduct()`
   - New endpoint: `PUT /api/products/featured/{productId}` to toggle featured status

### Frontend Changes
1. **ProductManagement.js** - Added:
   - Clickable featured badge on each product row
   - Gold badge with star (⭐) for featured products
   - Gray badge for non-featured products
   - Click handler to toggle featured status
   - Fixed image display to use correct paths

2. **ProductDetailModal.js** - Added:
   - Featured badge in modal header next to product name
   - Click to toggle featured status directly from modal
   - Visual feedback with hover states
   - Fixed image paths to use React public folder

## Features Implemented

### Product Management List
- **Featured Badge**: Each product row displays a badge showing featured status
  - Featured: Gold badge with "⭐ Featured"
  - Not Featured: Gray badge with "☆ Not Featured"
- **Toggle on Click**: Click the badge to instantly toggle featured status
- **Visual Feedback**: Hover effects provide clear interaction feedback

### Product Detail Modal
- **Header Badge**: Featured status badge appears next to product name in header
- **Toggle Functionality**: Click badge in modal to toggle featured status
- **Tooltips**: Hover tooltips explain what clicking will do

### Image Display Fix
- Images are now correctly loaded from the React app's public folder
- Image paths like `/images/guitars/strat.jpg` work correctly
- Fallback "No Image" display when image is missing or fails to load

## Testing the Feature

### 1. Start the API Server
```bash
cd FinalProjectAPI
dotnet run
```

### 2. Start the React App
```bash
cd client-app
npm start
```

### 3. Test the Functionality
1. Navigate to Product Management
2. Look for the featured badges on each product row
3. Click a badge to toggle featured status
4. Open a product detail modal
5. Click the featured badge in the modal header
6. Verify the status updates in both the list and modal

### 4. Verify Database Updates
```sql
SELECT ProductID, ProductName, IsFeatured, DateUpdated
FROM Products
WHERE IsFeatured = 1;
```

## API Endpoints

### Toggle Featured Status
```
PUT /api/products/featured/{productId}
Content-Type: application/json

Body: true or false
```

**Example Request:**
```bash
curl -X PUT http://localhost:5077/api/products/featured/1 \
  -H "Content-Type: application/json" \
  -d "true"
```

**Response:**
```json
{
  "productID": 1,
  "categoryID": 1,
  "categoryName": "Guitars",
  "productCode": "strat",
  "productName": "Fender Stratocaster",
  "listPrice": 699.0,
  "discountPercent": 30.0,
  "imageURL": "/images/guitars/strat.jpg",
  "isActive": true,
  "isFeatured": true,
  "dateUpdated": "2025-11-19T..."
}
```

## UI/UX Details

### Badge Styling
- **Featured State**:
  - Background: `#fef3c7` (light yellow)
  - Text: `#d97706` (orange)
  - Border: `#fbbf24` (gold)
  - Icon: ⭐ (filled star)

- **Not Featured State**:
  - Background: `#f3f4f6` (light gray)
  - Text: `#6b7280` (gray)
  - Border: `#d1d5db` (gray)
  - Icon: ☆ (empty star)

### Hover Effects
- Background color becomes slightly darker on hover
- Smooth transition (0.2s)
- Cursor changes to pointer
- Tooltip appears explaining the action

## Next Steps

To integrate with the home page:
1. Use the existing `GET /api/products/featured` endpoint
2. Filter products where `IsFeatured = true`
3. Display featured products in a special section
4. Optionally limit to top N featured products

## Troubleshooting

### Images Not Displaying
- Verify images exist in `client-app/public/images/` directory
- Check browser console for 404 errors
- Ensure `imageURL` in database starts with `/images/`

### Featured Status Not Updating
- Check browser console for API errors
- Verify SQL scripts have been executed
- Ensure API server is running
- Check database connection string

### Badge Not Appearing
- Verify `IsFeatured` column exists in database
- Check that `GetAllProducts` stored procedure returns `IsFeatured`
- Verify frontend is receiving the `isFeatured` property in product data
