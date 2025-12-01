# My Guitar Shop - API Endpoints Documentation

## Base URL
```
Development: http://localhost:5077
Production: [Your Production URL]
```

## Response Format
All API responses are in JSON format. Standard HTTP status codes are used to indicate success or failure.

### Standard Response Codes
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Authentication & Authorization

### Security Implementation
All authentication endpoints use **BCrypt password hashing** (BCrypt.Net-Next with work factor 12) for secure password storage and verification. Passwords are never stored in plain text.

### Login (Universal)
Authenticate users across all roles (customer, vendor, admin/employee).

**Endpoint:** `POST /api/auth/login`

**Security:** BCrypt password verification

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string", 
  "role": "customer|vendor|admin|employee"
}
```

**Response (200 OK):**
```json
{
  "id": "integer",
  "role": "string",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "dashboard": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Email and password are required
- `401 Unauthorized` - Invalid credentials or BCrypt verification failed

**Frontend Integration:**
After successful login, the frontend implements role-based redirects:
- **Vendors** → `/vendor-dashboard`
- **Admins/Employees** → `/admin-dashboard`
- **Customers** → `/` (homepage)

**Example:**
```bash
curl -X POST http://localhost:5077/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "customer@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

---

### Customer Registration
Register a new customer account with BCrypt password hashing.

**Endpoint:** `POST /api/auth/register-customer`

**Security:** Password hashed with BCrypt before storage

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "integer",
  "role": "customer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "dashboard": "customer"
}
```

**Error Responses:**
- `400 Bad Request` - All fields are required
- `400 Bad Request` - An account with this email already exists
- `500 Internal Server Error` - Registration failed



---

### Password Reset Request
Request a password reset token.

**Endpoint:** `POST /api/auth/request-password-reset`

**Request Body:**
```json
{
  "emailAddress": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Reset token sent to email (development: [token])",
  "token": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Email required
- `400 Bad Request` - Email not found in system

---

### Reset Password
Reset password using a valid token. New password is hashed with BCrypt.

**Endpoint:** `PUT /api/auth/reset-password`

**Security:** New password hashed with BCrypt before storage

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Token and new password required
- `400 Bad Request` - Invalid or expired token

---

### Change Password
Change a customer's password after verifying their current password.

**Endpoint:** `PUT /api/customer/change-password`

**Security:** BCrypt verification of old password, BCrypt hashing of new password

**Request Body:**
```json
{
  "customerID": "integer",
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Old password is incorrect (BCrypt verification failed)
- `400 Bad Request` - New password does not meet requirements (min 8 characters)
- `404 Not Found` - Customer not found

---

## Customer Management

### Get All Customers
Retrieve all customers from the system (admin access).

**Endpoint:** `GET /api/customer`

**Response (200 OK):**
```json
[
  {
    "customerID": "integer",
    "firstName": "string",
    "lastName": "string",
    "emailAddress": "string",
    "shippingAddressID": "integer|null",
    "billingAddressID": "integer|null",
    "isActive": "boolean"
  }
]
```

---

## Product Management

### Get All Products
Retrieve all products from the inventory.

**Endpoint:** `GET /api/products`

**Response (200 OK):**
```json
[
  {
    "productID": "integer",
    "categoryID": "integer", 
    "productCode": "string",
    "productName": "string",
    "description": "string",
    "listPrice": "decimal",
    "discountPercent": "decimal",
    "imageURL": "string",
    "isActive": "boolean",
    "dateAdded": "datetime",
    "dateUpdated": "datetime"
  }
]
```

**Frontend Integration:**
- **Customers**: Only see products with `isActive: true` on the homepage, search results, and product listings.
- **Admins/Employees**: Can view all products including inactive ones in the admin management interface.
- **Cart Access**: Vendors and employees are restricted from adding products to cart (frontend validation).

---

### Get Product by ID
Retrieve a specific product by its ID.

**Endpoint:** `GET /api/products/{productId}`

**Path Parameters:**
- `productId` (integer, required) - The ID of the product

**Response (200 OK):**
```json
{
  "productID": "integer",
  "categoryID": "integer",
  "productCode": "string", 
  "productName": "string",
  "description": "string",
  "listPrice": "decimal",
  "discountPercent": "decimal",
  "imageURL": "string",
  "isActive": "boolean",
  "dateAdded": "datetime",
  "dateUpdated": "datetime"
}
```

**Frontend Integration:**
- **Customers**: If `isActive: false`, an error message is displayed and the "Add to Cart" button is hidden.
- **Admins**: Can view inactive products without restrictions for management purposes.

---

### Get Featured Products
Retrieve products marked as featured for homepage display.

**Endpoint:** `GET /api/products/featured`

**Response (200 OK):**
```json
[
  {
    "productID": "integer",
    "productName": "string",
    "listPrice": "decimal",
    "imageURL": "string",
    "description": "string"
  }
]
```

**Frontend Integration:**
The frontend filters out inactive products (`isActive: false`) before displaying on the homepage and in search results. Only products with `isActive: true` are shown to customers.

---

### Get Best Sellers
Retrieve top-selling products based on sales data.

**Endpoint:** `GET /api/products/best-sellers`

**Response (200 OK):**
```json
[
  {
    "productID": "integer",
    "productName": "string",
    "listPrice": "decimal",
    "imageURL": "string",
    "totalSold": "integer"
  }
]
```

**Frontend Integration:**
The frontend filters out inactive products (`isActive: false`) before displaying. Only active products appear in the best sellers list for customers.

---

### Add New Product
Create a new product in the inventory.

**Endpoint:** `POST /api/products`

**Request Body:**
```json
{
  "categoryID": "integer",
  "productCode": "string",
  "productName": "string", 
  "description": "string",
  "listPrice": "decimal",
  "discountPercent": "decimal",
  "imageURL": "string"
}
```

**Response (200 OK):**
```json
{
  "productID": "integer",
  "categoryID": "integer",
  "productCode": "string",
  "productName": "string",
  "description": "string",
  "listPrice": "decimal",
  "discountPercent": "decimal",
  "imageURL": "string",
  "isActive": "boolean",
  "dateAdded": "datetime"
}
```

---

### Update Product
Update an existing product.

**Endpoint:** `PUT /api/products/{productId}`

**Path Parameters:**
- `productId` (integer, required) - The ID of the product to update

**Request Body:**
```json
{
  "productID": "integer",
  "categoryID": "integer",
  "productCode": "string",
  "productName": "string",
  "description": "string", 
  "listPrice": "decimal",
  "discountPercent": "decimal",
  "imageURL": "string"
}
```

**Response (200 OK):**
```json
{
  "productID": "integer",
  "categoryID": "integer",
  "productCode": "string",
  "productName": "string",
  "description": "string",
  "listPrice": "decimal", 
  "discountPercent": "decimal",
  "imageURL": "string",
  "isActive": "boolean",
  "dateUpdated": "datetime"
}
```

---

### Delete Product
Remove a product from the inventory.

**Endpoint:** `DELETE /api/products/{productId}`

**Path Parameters:**
- `productId` (integer, required) - The ID of the product to delete

**Response (200 OK):**
```json
{
  "message": "Product {productId} deleted successfully."
}
```

---

### Activate Product
Activate a previously deactivated product.

**Endpoint:** `PUT /api/products/activate/{productId}`

**Path Parameters:**
- `productId` (integer, required) - The ID of the product to activate

**Response (200 OK):**
```json
{
  "productID": "integer",
  "isActive": true,
  "message": "Product activated successfully"
}
```

---

### Deactivate Product
Deactivate a product without deleting it.

**Endpoint:** `PUT /api/products/deactivate/{productId}`

**Path Parameters:**
- `productId` (integer, required) - The ID of the product to deactivate

**Response (200 OK):**
```json
{
  "productID": "integer",
  "isActive": false,
  "message": "Product deactivated successfully"
}
```

---

### Upload Product Image
Upload an image file for a product.

**Endpoint:** `POST /api/products/upload-image`

**Request (multipart/form-data):**
- `file` (file, required) - The image file to upload
- `categoryName` (string, required) - The category name (guitars, basses, drums)

**Response (200 OK):**
```json
{
  "imageUrl": "/images/{category}/{filename}"
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded
- `400 Bad Request` - Invalid file type (only JPEG, PNG, GIF, WebP allowed)
- `400 Bad Request` - File size must be less than 5MB
- `500 Internal Server Error` - Failed to upload image

**Notes:**
- Accepted file types: .jpg, .jpeg, .png, .gif, .webp
- Maximum file size: 5MB
- Images are saved to client-app/public/images/{category}/
- Filenames are automatically generated using GUID to avoid collisions
- Category determines subfolder: guitars, basses, or drums (defaults to guitars)

---

## Category Management

### Get All Categories
Retrieve all product categories.

**Endpoint:** `GET /api/categories`

**Response (200 OK):**
```json
[
  {
    "categoryID": "integer",
    "categoryName": "string"
  }
]
```

---

### Get Products by Category
Retrieve all products in a specific category.

**Endpoint:** `GET /api/categories/{categoryId}/products`

**Path Parameters:**
- `categoryId` (integer, required) - The ID of the category

**Response (200 OK):**
```json
[
  {
    "productID": "integer",
    "productName": "string",
    "description": "string",
    "listPrice": "decimal",
    "discountPercent": "decimal",
    "imageURL": "string"
  }
]
```

---

## Customer Profile Management

### Get Customer Profile
Retrieve customer profile information.

**Endpoint:** `GET /api/customer/{customerId}`

**Path Parameters:**
- `customerId` (integer, required) - The ID of the customer

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "shippingAddressID": "integer|null",
  "billingAddressID": "integer|null"
}
```

---

---

### Add or Update Customer Address
Add or update a customer's shipping or billing address.

**Endpoint:** `PUT /api/customer/address`

**Request Body:**
```json
{
  "customerID": "integer",
  "addressType": "shipping|billing",
  "line1": "string",
  "line2": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "phone": "string"
}
```

**Response (200 OK):**
```json
{
  "success": 1,
  "addressID": "integer",
  "message": "Address saved successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid customer ID or address type
- `400 Bad Request` - Failed to save address

**Notes:**
- Address type must be either "shipping" or "billing"
- If address doesn't exist, it will be created
- If address exists, it will be updated
- Empty fields will be filled from existing record if updating

---

### Get Customer Addresses
Retrieve a customer's shipping and billing addresses.

**Endpoint:** `GET /api/customer/{customerId}/addresses`

**Path Parameters:**
- `customerId` (integer, required) - The ID of the customer

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "shippingAddressID": "integer|null",
  "shippingLine1": "string",
  "shippingLine2": "string",
  "shippingCity": "string",
  "shippingState": "string",
  "shippingZipCode": "string",
  "shippingPhone": "string",
  "billingAddressID": "integer|null",
  "billingLine1": "string",
  "billingLine2": "string",
  "billingCity": "string",
  "billingState": "string",
  "billingZipCode": "string",
  "billingPhone": "string"
}
```

**Error Responses:**
- `404 Not Found` - Customer not found

---

### Check Customer Exists
Check if a customer account exists with the given email.

**Endpoint:** `GET /api/customer/exists/{email}`

**Path Parameters:**
- `email` (string, required) - The email address to check

**Response (200 OK):**
```json
{
  "exists": "boolean",
  "customerID": "integer|null"
}
```

---

### Deactivate Customer
Deactivate a customer account without permanently deleting it. Also disables all associated addresses.

**Endpoint:** `PUT /api/customer/deactivate/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the customer to deactivate

**Response (200 OK):**
```json
"Customer {id} deactivated successfully."
```

**Error Responses:**
- `400 Bad Request` - Invalid CustomerID
- `500 Internal Server Error` - Failed to deactivate customer

**Stored Procedure:** `DeactivateCustomer`
- Sets `IsActive = 0` on customer record
- Sets `Disabled = 1` on all customer addresses
- Updates `DateUpdated` timestamp

---

### Activate Customer
Activate a previously deactivated customer account. Also enables all associated addresses.

**Endpoint:** `PUT /api/customer/activate/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the customer to activate

**Response (200 OK):**
```json
"Customer {id} activated successfully."
```

**Error Responses:**
- `400 Bad Request` - Invalid CustomerID
- `500 Internal Server Error` - Failed to activate customer

**Stored Procedure:** `ActivateCustomer`
- Sets `IsActive = 1` on customer record
- Sets `Disabled = 0` on all customer addresses
- Updates `DateUpdated` timestamp

---

### Delete Customer
Remove a customer account.

**Endpoint:** `DELETE /api/customer/delete/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the customer to delete

**Response (200 OK):**
```json
{
  "message": "Customer deleted successfully"
}
```

---

## Vendor Management

### Generate Vendor Registration Token
Generate a secure registration token for a vendor to create their login account. Token expires in 48 hours.

**Endpoint:** `POST /api/vendors/generate-token/{vendorId}`

**Path Parameters:**
- `vendorId` (integer, required) - The ID of the vendor

**Response (200 OK):**
```json
{
  "registrationToken": "string",
  "tokenExpiry": "datetime",
  "hoursUntilExpiry": "integer",
  "vendorID": "integer",
  "vendorName": "string",
  "firstName": "string",
  "lastName": "string",
  "vendorEmail": "string",
  "status": "Success|Warning|Error",
  "message": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Vendor already has an account or not found

---

### Vendor Registration (Using Token)
Register a vendor account using a registration token provided by admin. Token is one-time use and expires in 48 hours.

**Endpoint:** `POST /api/auth/register-vendor`

**Security:** Password hashed with BCrypt before storage, token validated for expiration and one-time use

**Request Body:**
```json
{
  "registrationToken": "string",
  "vendorEmail": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "string",
  "vendorID": "integer",
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token, email mismatch, or vendor already has account

---

### Get All Vendors
Retrieve all vendors from the system.

**Endpoint:** `GET /api/vendors`

**Response (200 OK):**
```json
[
  {
    "vendorID": "integer",
    "vendorName": "string",
    "vendorAddress1": "string",
    "vendorAddress2": "string",
    "vendorCity": "string",
    "vendorState": "string",
    "vendorZipCode": "string",
    "vendorPhone": "string",
    "vendorContactLName": "string",
    "vendorContactFName": "string",
    "defaultTermsID": "integer",
    "defaultAccountNo": "string",
    "isActive": "boolean"
  }
]
```

---

### Get Vendor by ID
Retrieve a specific vendor by ID.

**Endpoint:** `GET /api/vendors/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the vendor

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorAddress1": "string",
  "vendorAddress2": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorZipCode": "string",
  "vendorPhone": "string", 
  "vendorContactLName": "string",
  "vendorContactFName": "string",
  "defaultTermsID": "integer",
  "defaultAccountNo": "string",
  "isActive": "boolean"
}
```

---

### Get All Payment Terms
Retrieve all payment terms available for vendor configuration.

**Endpoint:** `GET /api/vendors/terms`

**Response (200 OK):**
```json
[
  {
    "termsID": "integer",
    "termsDescription": "string",
    "termsDueDays": "integer"
  }
]
```

**Example Response:**
```json
[
  {
    "termsID": 1,
    "termsDescription": "Net due 10 days",
    "termsDueDays": 10
  },
  {
    "termsID": 2,
    "termsDescription": "Net due 20 days",
    "termsDueDays": 20
  },
  {
    "termsID": 3,
    "termsDescription": "Net due 30 days",
    "termsDueDays": 30
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to retrieve payment terms

**Frontend Integration:**
This endpoint populates the "Payment Terms" dropdown in the Add/Edit Vendor forms. The `termsID` is stored in the vendor record as `defaultTermsID`.

---

### Get All GL Accounts
Retrieve all general ledger accounts available for vendor configuration.

**Endpoint:** `GET /api/vendors/accounts`

**Response (200 OK):**
```json
[
  {
    "accountNo": "integer",
    "accountDescription": "string"
  }
]
```

**Example Response:**
```json
[
  {
    "accountNo": 100,
    "accountDescription": "Cash"
  },
  {
    "accountNo": 200,
    "accountDescription": "Accounts Payable"
  },
  {
    "accountNo": 570,
    "accountDescription": "Office Supplies"
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to retrieve GL accounts

**Frontend Integration:**
This endpoint populates the "Default Account" dropdown in the Add/Edit Vendor forms. The `accountNo` is stored in the vendor record as `defaultAccountNo`.

---

### Add New Vendor
Create a new vendor in the system.

**Endpoint:** `POST /api/vendors/add`

**Request Body:**
```json
{
  "vendorName": "string",
  "vendorAddress1": "string",
  "vendorAddress2": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorZipCode": "string",
  "vendorPhone": "string",
  "vendorContactLName": "string",
  "vendorContactFName": "string",
  "defaultTermsID": "integer",
  "defaultAccountNo": "string"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorAddress1": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorZipCode": "string",
  "vendorPhone": "string",
  "vendorContactLName": "string", 
  "vendorContactFName": "string",
  "isActive": true
}
```

---

### Update Vendor
Update existing vendor information.

**Endpoint:** `PUT /api/vendors/update`

**Request Body:**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorAddress1": "string",
  "vendorAddress2": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorZipCode": "string",
  "vendorPhone": "string",
  "vendorContactLName": "string",
  "vendorContactFName": "string",
  "defaultTermsID": "integer",
  "defaultAccountNo": "string",
  "isActive": "boolean"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "message": "Vendor updated successfully"
}
```

---

### Delete Vendor
Remove a vendor from the system.

**Endpoint:** `DELETE /api/vendors/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the vendor to delete

**Response (200 OK):**
```json
{
  "message": "Vendor deleted successfully"
}
```

---

### Activate Vendor
Activate a previously deactivated vendor.

**Endpoint:** `PUT /api/vendors/activate/{vendorId}`

**Path Parameters:**
- `vendorId` (integer, required) - The ID of the vendor to activate

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "isActive": true,
  "message": "Vendor activated successfully"
}
```

---

### Deactivate Vendor
Deactivate a vendor without deleting it.

**Endpoint:** `PUT /api/vendors/deactivate/{vendorId}`

**Path Parameters:**
- `vendorId` (integer, required) - The ID of the vendor to deactivate

**Response (200 OK):**
```json
{
  "vendorID": "integer", 
  "isActive": false,
  "message": "Vendor deactivated successfully"
}
```

---

## Invoice Management

### Get All Invoices
Retrieve all invoices from the system (admin access).

**Endpoint:** `GET /api/invoices`

**Response (200 OK):**
```json
[
  {
    "invoiceID": "integer",
    "vendorID": "integer|null",
    "vendorName": "string",
    "customerName": "string|null",
    "invoiceNumber": "string",
    "invoiceDate": "datetime",
    "totalAmount": "decimal",
    "paymentTotal": "decimal",
    "creditTotal": "decimal",
    "amountDue": "decimal",
    "dueDate": "datetime|null",
    "isPaid": "boolean"
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to retrieve invoices

---

### Get Vendor Invoices
Retrieve all invoices for a specific vendor.

**Endpoint:** `GET /api/invoices/vendor/{vendorId}`

**Path Parameters:**
- `vendorId` (integer, required) - The ID of the vendor

**Response (200 OK):**
```json
[
  {
    "invoiceID": "integer",
    "invoiceNumber": "string",
    "invoiceDate": "datetime",
    "invoiceTotal": "decimal",
    "paymentTotal": "decimal",
    "creditTotal": "decimal",
    "invoiceDueDate": "datetime|null",
    "paymentDate": "datetime|null",
    "termsDescription": "string"
  }
]
```

---

### Get Invoice Detail
Retrieve detailed information for a specific invoice.

**Endpoint:** `GET /api/invoices/{invoiceId}`

**Path Parameters:**
- `invoiceId` (integer, required) - The ID of the invoice

**Response (200 OK):**
```json
{
  "invoiceID": "integer",
  "vendorID": "integer",
  "invoiceNumber": "string",
  "invoiceDate": "datetime",
  "invoiceTotal": "decimal",
  "paymentTotal": "decimal",
  "creditTotal": "decimal",
  "invoiceDueDate": "datetime|null",
  "paymentDate": "datetime|null",
  "termsDescription": "string",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorPhone": "string"
}
```

---

### Get Archived Invoices
Retrieve all archived invoices from the system.

**Endpoint:** `GET /api/invoices/archived`

**Response (200 OK):**
```json
[
  {
    "invoiceID": "integer",
    "vendorID": "integer|null",
    "vendorName": "string",
    "invoiceNumber": "string",
    "invoiceDate": "datetime",
    "totalAmount": "decimal",
    "paymentTotal": "decimal",
    "creditTotal": "decimal",
    "amountDue": "decimal",
    "dueDate": "datetime|null",
    "paymentDate": "datetime|null",
    "isPaid": "boolean",
    "termsDescription": "string"
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to retrieve archived invoices

---

### Get Archived Invoice Detail
Retrieve detailed information for a specific archived invoice.

**Endpoint:** `GET /api/invoices/archived/{invoiceId}`

**Path Parameters:**
- `invoiceId` (integer, required) - The ID of the archived invoice

**Response (200 OK):**
```json
{
  "invoiceID": "integer",
  "vendorID": "integer",
  "invoiceNumber": "string",
  "invoiceDate": "datetime",
  "invoiceTotal": "decimal",
  "paymentTotal": "decimal",
  "creditTotal": "decimal",
  "termsID": "integer|null",
  "termsDescription": "string",
  "termsDueDays": "integer|null",
  "invoiceDueDate": "datetime|null",
  "paymentDate": "datetime|null",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "vendorAddress1": "string",
  "vendorAddress2": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorZipCode": "string",
  "vendorPhone": "string",
  "vendorEmail": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid invoice ID
- `404 Not Found` - Archived invoice not found
- `500 Internal Server Error` - Failed to retrieve archived invoice details

---

## Dashboard Endpoints

### Get Customer Dashboard
Retrieve dashboard data for a specific customer.

**Endpoint:** `GET /api/dashboard/customer/{customerId}`

**Path Parameters:**
- `customerId` (integer, required) - The ID of the customer

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "totalOrders": "integer",
  "totalSpent": "decimal",
  "recentOrders": [
    {
      "orderID": "integer",
      "orderDate": "datetime",
      "orderTotal": "decimal",
      "orderStatus": "string"
    }
  ]
}
```

---

### Get Vendor Dashboard
Retrieve dashboard data for a specific vendor.

**Endpoint:** `GET /api/dashboard/vendor/{vendorId}`

**Path Parameters:**
- `vendorId` (integer, required) - The ID of the vendor

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "vendorCity": "string",
  "vendorState": "string",
  "vendorPhone": "string",
  "totalInvoices": "integer",
  "totalOutstanding": "decimal",
  "recentInvoices": [
    {
      "invoiceID": "integer",
      "invoiceNumber": "string",
      "invoiceDate": "datetime",
      "invoiceTotal": "decimal",
      "isPaid": "boolean"
    }
  ]
}
```

---

### Get Admin Dashboard
Retrieve comprehensive dashboard data for administrators.

**Endpoint:** `GET /api/dashboard/admin`

**Response (200 OK):**
```json
{
  "totalCustomers": "integer",
  "activeCustomers": "integer",
  "totalVendors": "integer", 
  "activeVendors": "integer",
  "totalProducts": "integer",
  "totalSales": "decimal",
  "totalOutstandingInvoices": "decimal",
  "vendors": [
    {
      "vendorID": "integer",
      "vendorName": "string",
      "isActive": "boolean"
    }
  ],
  "products": [
    {
      "productID": "integer",
      "productName": "string",
      "listPrice": "decimal",
      "stockQuantity": "integer",
      "categoryName": "string"
    }
  ]
}
```

---

## Error Handling

### Error Response Format
All error responses return a simple string message with appropriate HTTP status codes:

**Example Error Responses:**
```json
"Invalid ProductID."
```

```json
"Internal server error: Failed to retrieve product."
```

```json
"Invalid customer credentials."
```

### Common Error Codes

#### 400 Bad Request
Returns a string message describing the validation error:
```json
"Email and password are required."
```

#### 401 Unauthorized
Returns a string message for authentication failures:
```json
"Invalid customer credentials."
```

#### 404 Not Found
Returns a string message when resource is not found:
```json
"Product with ID 123 not found."
```

#### 500 Internal Server Error
Returns a generic error message:
```json
"Internal server error: Failed to retrieve products."
```

---

## API Testing

### Using HTTP Client File
The project includes a `FinalProjectAPI.http` file with pre-configured requests for testing all endpoints. Open this file in Visual Studio Code with the REST Client extension to test the API.

### Example cURL Commands

**Customer Registration with BCrypt:**
```bash
curl -X POST http://localhost:5077/api/customer/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "emailAddress": "john.doe@example.com",
    "password": "SecurePass123",
    "confirmPassword": "SecurePass123"
  }'
```

**Customer Login with BCrypt Verification:**
```bash
curl -X POST http://localhost:5077/api/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

**Change Password:**
```bash
curl -X PUT http://localhost:5077/api/customer/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "customerID": 1,
    "oldPassword": "SecurePass123",
    "newPassword": "NewSecurePass456"
  }'
```

**Vendor Registration:**
```bash
curl -X POST http://localhost:5077/api/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "vendorName": "Guitar Strings Inc",
    "vendorAddress1": "123 Music Ave",
    "vendorCity": "Nashville",
    "vendorState": "TN",
    "vendorZipCode": "37201",
    "vendorPhone": "615-555-1234",
    "vendorContactFName": "Jane",
    "vendorContactLName": "Smith",
    "emailAddress": "jane@guitarstrings.com",
    "password": "VendorPass123",
    "confirmPassword": "VendorPass123",
    "defaultTermsID": 1,
    "defaultAccountNo": "12345"
  }'
```

**Get All Products:**
```bash
curl -X GET http://localhost:5077/api/products \
  -H "Accept: application/json"
```

**Add New Product:**
```bash
curl -X POST http://localhost:5077/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "categoryID": 1,
    "productCode": "GUIT001",
    "productName": "Acoustic Guitar",
    "description": "High-quality acoustic guitar",
    "listPrice": 299.99,
    "discountPercent": 10.0,
    "imageURL": "/images/guitars/acoustic.jpg"
  }'
```

**Universal Login:**
```bash
curl -X POST http://localhost:5077/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailAddress": "customer@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

**Request Password Reset:**
```bash
curl -X POST http://localhost:5077/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com"
  }'
```

### Postman Collection
Import the provided HTTP requests into Postman for a more user-friendly testing experience. The base URL variable can be set to switch between development and production environments.

---

## Rate Limiting and Security

### Security Considerations
- **Password Hashing:** All passwords are hashed using BCrypt (BCrypt.Net-Next) with work factor 12 before storage
- **Password Verification:** BCrypt.Verify is used for all authentication attempts
- **SQL Injection Protection:** All database operations use parameterized stored procedures
- **Input Validation:** Comprehensive validation on all endpoints
- **CORS Configuration:** Configured for development environment (localhost:3000)
- **Password Requirements:** Minimum 8 characters for all passwords
- **No Plain Text Passwords:** Passwords are never stored or logged in plain text

### Authentication Flow
1. User submits credentials (email + password)
2. System retrieves stored BCrypt hash from database
3. BCrypt.Verify compares submitted password with stored hash
4. On success, user session is established
5. On failure, generic "Invalid credentials" error is returned

### Password Reset Flow
1. User requests reset via email
2. System generates unique reset token
3. Token is stored with expiration timestamp
4. User submits token + new password
5. New password is hashed with BCrypt before storage
6. Token is invalidated after successful reset

### Rate Limiting
Currently no rate limiting is implemented. Consider adding rate limiting for production deployment:
- Login attempts: 5 per minute per IP
- API calls: 100 per minute per user
- Registration: 3 per hour per IP
- Password reset requests: 3 per hour per email

---

## API Versioning

### Current Version
- **Version:** 1.0
- **Base Path:** `/api/`
- **Documentation Date:** November 2025
 

---

## Support and Documentation

### Additional Resources
- [Project Overview](ProjectOverview.md) - Complete project description and requirements
- [Setup Instructions](SetupInstructions.md) - Installation and configuration guide
- [Database Design](SQLDesign.md) - Database schema and SQL stored procedures documentation
- [Testing Plan](TestingPlan.md) - Comprehensive testing procedures and strategies
- [Architecture Decisions](ArchitectureDecisions.md) - Key architectural decisions and design patterns
- [OOP Concepts Summary](OOPConceptsSummary.md) - Object-oriented programming concepts implemented
- [Token Security Implementation](TokenSecurityImplementation.md) - Vendor registration token system documentation

### Contact Information
- **Developer:** Leena Komenski
- **Project:** My Guitar Shop Management System
- **Course:** Final Project API Development
- **Date:** November 2025
