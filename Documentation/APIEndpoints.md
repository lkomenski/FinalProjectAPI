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

### Customer Login (Dedicated Endpoint)
Authenticate customers with BCrypt password verification.

**Endpoint:** `POST /api/auth/customer/login`

**Security:** BCrypt password verification

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string"
}
```

---

### Vendor Login (Dedicated Endpoint)
Authenticate vendors with BCrypt password verification.

**Endpoint:** `POST /api/auth/vendor/login`

**Security:** BCrypt password verification

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "emailAddress": "string"
}
```

---

### Customer Registration
Register a new customer account with BCrypt password hashing.

**Endpoint:** `POST /api/customer/register`

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
  "customerId": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "message": "Registration successful"
}
```

**Error Responses:**
- `400 Bad Request` - Password and confirmation password do not match
- `400 Bad Request` - Email, password, first name, and last name are required
- `409 Conflict` - Email address already exists

---

### Vendor Registration
Register a new vendor account with business information.

**Endpoint:** `POST /api/vendors/register`

**Security:** Password hashed with BCrypt before storage

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
  "emailAddress": "string",
  "password": "string",
  "confirmPassword": "string",
  "defaultTermsID": "integer",
  "defaultAccountNo": "string"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "emailAddress": "string",
  "message": "Vendor registration successful"
}
```

**Error Responses:**
- `400 Bad Request` - Password and confirmation password do not match
- `400 Bad Request` - Required fields are missing
- `409 Conflict` - Email address already exists

---

### Password Reset Request
Request a password reset token.

**Endpoint:** `POST /api/password-reset/request`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string",
  "message": "Password reset token generated. Check your email."
}
```

**Error Responses:**
- `404 Not Found` - Email address not found

---

### Reset Password
Reset password using a valid token. New password is hashed with BCrypt.

**Endpoint:** `POST /api/password-reset/reset`

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
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - New password does not meet requirements

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

## Customer Management

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

### Update Customer Profile
Update customer profile information.

**Endpoint:** `PUT /api/customer/{customerId}`

**Path Parameters:**
- `customerId` (integer, required) - The ID of the customer

**Request Body:**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string"
}
```

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string",
  "message": "Profile updated successfully"
}
```

---

### Customer Registration (Alternative Endpoint - Deprecated)
Register a new customer account.

**Endpoint:** `POST /api/customer/register`

**Note:** Use `POST /api/customer/register` for new implementations.

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
  "customerId": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string"
}
```

---

### Customer Login (Alternative Endpoint - Deprecated)
Authenticate a customer.

**Endpoint:** `POST /api/customer/login`

**Note:** Use `POST /api/auth/customer/login` for new implementations.

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "customerID": "integer",
  "firstName": "string",
  "lastName": "string",
  "emailAddress": "string"
}
```

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
Deactivate a customer account.

**Endpoint:** `PUT /api/customer/deactivate/{id}`

**Path Parameters:**
- `id` (integer, required) - The ID of the customer to deactivate

**Response (200 OK):**
```json
{
  "message": "Customer deactivated successfully",
  "customerID": "integer"
}
```

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

### Vendor Registration
Register a new vendor account with complete business information.

**Endpoint:** `POST /api/vendors/register`

**Security:** Password hashed with BCrypt before storage

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
  "emailAddress": "string",
  "password": "string",
  "confirmPassword": "string",
  "defaultTermsID": "integer",
  "defaultAccountNo": "string"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "emailAddress": "string",
  "isActive": true,
  "message": "Vendor registration successful"
}
```

---

### Vendor Login
Authenticate a vendor with BCrypt password verification.

**Endpoint:** `POST /api/auth/vendor/login`

**Security:** BCrypt password verification

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "vendorID": "integer",
  "vendorName": "string",
  "vendorContactFName": "string",
  "vendorContactLName": "string",
  "emailAddress": "string"
}
```

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

## Password Reset Management

### Request Password Reset
Request a password reset for a customer.

**Endpoint:** `POST /api/password-reset/request`

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string",
  "message": "Password reset token generated. Check your email."
}
```

**Error Responses:**
- `404 Not Found` - Email address not found

---

### Reset Password
Reset customer password using a valid token. New password is hashed with BCrypt.

**Endpoint:** `POST /api/password-reset/reset`

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
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired token
- `400 Bad Request` - New password does not meet requirements (min 8 characters)

---

## Legacy Login Endpoint

### Universal Login (Legacy)
Alternative login endpoint for backward compatibility.

**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "emailAddress": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "role": "string",
  "user": {
    "id": "integer",
    "name": "string",
    "email": "string"
  }
}
```

---

## Error Handling

### Error Response Format
All error responses follow this format:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": "integer"
}
```

### Common Error Codes

#### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid input parameters",
  "statusCode": 400
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized", 
  "message": "Invalid credentials",
  "statusCode": 401
}
```

#### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "statusCode": 404
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "statusCode": 500
}
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
curl -X POST http://localhost:5077/api/password-reset/request \
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

### Future Versions
Future API versions will be implemented using URL versioning:
- Version 1.0: `/api/v1/`
- Version 2.0: `/api/v2/`

---

## Support and Documentation

### Additional Resources
- [Project Overview](ProjectOverview.md) - Complete project description
- [Setup Instructions](SetupInstructions.md) - Installation and configuration guide  
- [Database Design](SQLDesign.md) - Database schema documentation
- [Testing Plan](TestingPlan.md) - Comprehensive testing procedures

### Contact Information
- **Developer:** Leena Komenski
- **Project:** My Guitar Shop Management System
- **Course:** Final Project API Development
- **Date:** November 2025
