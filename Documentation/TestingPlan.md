# My Guitar Shop - Testing Plan Documentation

## Project Information
- **Project Name:** My Guitar Shop Management System
- **Author:** Leena Komenski
- **Course:** Final Project API Development
- **Date:** November 2025
- **Testing Framework:** Manual Testing with HTTP Client & Automated API Testing

## Testing Overview

### Testing Objectives
The testing plan ensures the My Guitar Shop Management System meets all functional requirements, provides robust security, and delivers a reliable user experience across all user roles (customers, vendors, and administrators).

### Testing Scope
- **Backend API Testing** - All controller endpoints and business logic
- **Database Testing** - Stored procedure validation and data integrity
- **Authentication Testing** - Role-based access control and security
- **Integration Testing** - End-to-end workflows and system interactions
- **Performance Testing** - Response times and concurrent user handling
- **Security Testing** - Data validation and SQL injection prevention

### Testing Environment
- **Development Environment:** `http://localhost:5077`
- **Database:** SQL Server with MyGuitarShop and AP databases
- **Testing Tools:** HTTP Client, Postman, SQL Server Management Studio
- **Test Data:** Sample customers, vendors, products, and invoices

## Test Categories

## 1. Authentication & Authorization Testing

### 1.1 Customer Authentication Tests

#### Test Case: Customer Registration
```http
POST http://localhost:5077/api/auth/register-customer
Content-Type: application/json

{
  "EmailAddress": "testcustomer@example.com",
  "Password": "SecurePass123",
  "FirstName": "John",
  "LastName": "Doe"
}
```

**Expected Results:**
- Status: `200 OK`
- Response includes: CustomerID, EmailAddress, Role
- Database verification: Customer record created in MyGuitarShop.Customers table

#### Test Case: Customer Login (Valid Credentials)
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "testcustomer@example.com",
  "Password": "password",
  "Role": "customer"
}
```

**Expected Results:**
- Status: `200 OK`
- Response includes: User information, Role: "Customer"

#### Test Case: Customer Login (Invalid Credentials)
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "testcustomer@example.com",
  "Password": "wrongpassword",
  "Role": "customer"
}
```

**Expected Results:**
- Status: `401 Unauthorized`
- Error message: Authentication failed

### 1.2 Vendor Authentication Tests

#### Test Case: Vendor Login (Valid Credentials)
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "vendor@example.com",
  "Password": "VendorPass123",
  "Role": "vendor"
}
```

**Expected Results:**
- Status: `200 OK`
- Response includes: VendorID, Role: "Vendor"
- Database: AP.Vendors table verification

### 1.3 Employee/Admin Authentication Tests

#### Test Case: Employee Login
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "admin@guitarshop.com",
  "Password": "AdminPass123",
  "Role": "admin"
}
```

**Expected Results:**
- Status: `200 OK`
- Response includes: AdminID, Role: "Employee"

### 1.4 Password Reset Testing

#### Test Case: Password Reset Request
```http
POST http://localhost:5077/api/auth/request-password-reset
Content-Type: application/json

{
  "emailAddress": "testcustomer@example.com"
}
```

**Expected Results:**
- Status: `200 OK`
- Reset token generated and returned
- Database: ResetToken stored in Customers table

#### Test Case: Password Reset Completion
```http
PUT http://localhost:5077/api/auth/reset-password
Content-Type: application/json

{
  "token": "[generated_token]",
  "newPassword": "NewSecurePass123"
}
```

**Expected Results:**
- Status: `200 OK`
- Password updated in database
- Customer can login with new password

### 1.5 Password Validation Consistency Testing (November 30, 2025)

#### Test Case: Password Validation - Valid Passwords
**Test passwords that should pass validation (8+ characters, at least 1 digit):**
- `password1` - Pass (8 chars, has digit)
- `MyP@ssw0rd!` - Pass (symbols allowed, has digit)
- `my guitar 8` - Pass (spaces allowed, has digit)
- `Testing123` - Pass (mixed case, has digits)

**Test Method:**
```http
POST http://localhost:5077/api/auth/register-customer
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "emailAddress": "test@example.com",
  "password": "password1",
  "confirmPassword": "password1"
}
```

**Expected Results:**
- Status: `200 OK`
- Account created successfully
- Frontend and backend both accept password

#### Test Case: Password Validation - Invalid Passwords
**Test passwords that should fail validation:**
- `short1` - Fail (only 6 characters)
- `password` - Fail (no digit)
- `12345678` - Pass (has 8+ chars and digits, no letter required)

**Expected Results:**
- Status: `400 Bad Request`
- Error message: "Password must be at least 8 characters long and contain at least one number"
- Frontend validation matches backend validation

#### Test Case: Frontend-Backend Validation Consistency
**Validation Points:**
1. Registration form (frontend validation)
2. Customer registration API (backend validation)
3. Password reset form (frontend validation)
4. Password reset API (backend validation)
5. Change password form (frontend validation)
6. Change password API (backend validation)

**Expected Results:**
- All validation points use same rules: 8+ characters with 1+ digit
- No discrepancies between frontend and backend
- Consistent error messages across all entry points

## 2. Product Management Testing

### 2.1 Product Retrieval Tests

#### Test Case: Get All Products
```http
GET http://localhost:5077/api/products
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns array of products with: ProductID, ProductName, Description, ListPrice, DiscountPercent, ImageURL, IsActive

#### Test Case: Get Product by ID
```http
GET http://localhost:5077/api/products/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK` (if product exists)
- Status: `404 Not Found` (if product doesn't exist)
- Single product object returned

#### Test Case: Get Featured Products
```http
GET http://localhost:5077/api/products/featured
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns featured products array
- Validates GetFeaturedProducts stored procedure

#### Test Case: Get Best Sellers
```http
GET http://localhost:5077/api/products/bestsellers
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns best-selling products based on sales data

### 2.2 Product Management Tests (Admin Only)

#### Test Case: Add New Product
```http
POST http://localhost:5077/api/products/add
Content-Type: application/json

{
  "CategoryID": 1,
  "ProductCode": "GTR999",
  "ProductName": "Test Electric Guitar",
  "Description": "A test guitar for validation",
  "ListPrice": 599.99,
  "DiscountPercent": 15.00,
  "ImageURL": "/images/guitars/test.jpg"
}
```

**Expected Results:**
- Status: `200 OK`
- Product created with IsActive = true
- Database: Verify product in Products table

#### Test Case: Update Product
```http
PUT http://localhost:5077/api/products/update/1
Content-Type: application/json

{
  "ProductID": 1,
  "ProductName": "Updated Guitar Name",
  "ListPrice": 649.99
}
```

**Expected Results:**
- Status: `200 OK`
- Product details updated in database
- DateUpdated field populated

#### Test Case: Activate/Deactivate Product
```http
PUT http://localhost:5077/api/products/activate/1
```

```http
PUT http://localhost:5077/api/products/deactivate/1
```

**Expected Results:**
- Status: `200 OK`
- IsActive flag toggled appropriately

### 2.3 Product Image Upload Testing (November 30, 2025)

#### Test Case: Upload Valid Product Image
```http
POST http://localhost:5077/api/products/upload-image
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="guitar.jpg"
Content-Type: image/jpeg

[binary image data]
--boundary
Content-Disposition: form-data; name="categoryName"

guitars
--boundary--
```

**Expected Results:**
- Status: `200 OK`
- Response: `{ "imageUrl": "/images/guitars/{guid}.jpg" }`
- File saved to: `client-app/public/images/guitars/`
- Filename: GUID-based (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg`)

#### Test Case: Upload Image - Invalid File Type
```http
POST http://localhost:5077/api/products/upload-image
Content-Type: multipart/form-data

file: document.pdf
categoryName: guitars
```

**Expected Results:**
- Status: `400 Bad Request`
- Error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."

#### Test Case: Upload Image - File Too Large
```http
POST http://localhost:5077/api/products/upload-image
Content-Type: multipart/form-data

file: large_image.jpg (6MB)
categoryName: guitars
```

**Expected Results:**
- Status: `400 Bad Request`
- Error: "File size must be less than 5MB."

#### Test Case: Upload Image - No File Provided
```http
POST http://localhost:5077/api/products/upload-image
Content-Type: multipart/form-data

categoryName: guitars
```

**Expected Results:**
- Status: `400 Bad Request`
- Error: "No file uploaded."

#### Test Case: Image Upload - Category Organization
**Test different categories:**
- `categoryName: "guitars"` - Saves to `/images/guitars/`
- `categoryName: "basses"` - Saves to `/images/basses/`
- `categoryName: "drums"` - Saves to `/images/drums/`
- `categoryName: "unknown"` - Defaults to `/images/guitars/`

**Expected Results:**
- Images saved to correct category subfolder
- Frontend can access images via public path
- GUID filenames prevent collisions

#### Test Case: Image Upload Security Validation
**Security Checks:**
1. File extension validation (whitelist: .jpg, .jpeg, .png, .gif, .webp)
2. File size limit enforcement (5MB maximum)
3. GUID-based naming prevents path traversal attacks
4. No executable file uploads (.exe, .bat, .sh)

**Expected Results:**
- All security validations enforced
- Malicious file uploads rejected
- Safe filename generation

## 3. Category Management Testing

### 3.1 Category Retrieval Tests

#### Test Case: Get All Categories
```http
GET http://localhost:5077/api/categories
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns all categories ordered by CategoryName

#### Test Case: Get Products by Category
```http
GET http://localhost:5077/api/categories/1/products
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns products filtered by specified category
- Only active products shown

## 4. Customer Management Testing

### 4.1 Customer Profile Tests

#### Test Case: Get Customer Profile
```http
GET http://localhost:5077/api/customer/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns customer profile with: CustomerID, FirstName, LastName, EmailAddress

### 4.2 GDPR-Compliant Customer Deletion Testing (November 30, 2025)

#### Test Case: Delete Customer - Data Anonymization
```http
DELETE http://localhost:5077/api/customer/delete/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Message: "Customer deleted successfully"

**Database Verification:**
```sql
-- Verify customer data anonymization
SELECT CustomerID, EmailAddress, Password, FirstName, LastName, IsActive
FROM Customers
WHERE CustomerID = 1;
```

**Expected Database State:**
- `EmailAddress`: `deleted_user_1@anonymized.com`
- `Password`: `[DELETED]` (not NULL, invalid BCrypt hash)
- `FirstName`: `Deleted`
- `LastName`: `User`
- `IsActive`: `0`
- `CustomerID`: Preserved (for order history integrity)
- `DateUpdated`: Set to deletion timestamp

**Order History Verification:**
```sql
-- Verify order history preserved
SELECT o.OrderID, o.CustomerID, o.OrderDate, o.OrderTotal
FROM Orders o
WHERE o.CustomerID = 1;
```

**Expected Results:**
- Order records remain intact
- Foreign key relationships preserved
- Financial data unchanged

#### Test Case: Delete Customer - Login Prevention
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "emailAddress": "deleted_user_1@anonymized.com",
  "password": "any_password",
  "role": "customer"
}
```

**Expected Results:**
- Status: `401 Unauthorized`
- Error: "Invalid credentials"
- `[DELETED]` password cannot match any BCrypt verification

#### Test Case: Delete Customer - Error Handling
```http
DELETE http://localhost:5077/api/customer/delete/99999
Accept: application/json
```

**Expected Results:**
- Status: `500 Internal Server Error` (from stored procedure Status check)
- Error message from stored procedure: "Customer not found" or similar

### 4.3 Enhanced Error Handling Testing (November 30, 2025)

#### Test Case: Stored Procedure Status Checking - Delete Operations
**Test DeleteCustomer with invalid ID:**
```http
DELETE http://localhost:5077/api/customer/delete/99999
```

**Expected Results:**
- Stored procedure returns: `Status: "Error"`, `Message: "Customer not found"`
- Controller checks Status field
- Returns: `500 Internal Server Error` with error message
- No silent failures

**Test DeleteVendor with invalid ID:**
```http
DELETE http://localhost:5077/api/vendors/99999
```

**Expected Results:**
- Status: `500 Internal Server Error`
- Error message propagated from stored procedure

**Test DeleteProduct with invalid ID:**
```http
DELETE http://localhost:5077/api/products/99999
```

**Expected Results:**
- Status: `500 Internal Server Error`
- Proper error message from stored procedure

#### Test Case: Error Propagation Verification
**Database Test:**
```sql
-- Test stored procedure error responses
EXEC DeleteCustomer @CustomerID = 99999;
-- Should return: Status='Error', Message='Customer not found'

EXEC DeleteVendorById @VendorID = 99999, @Delete = 0;
-- Should return: Status='Error', Message='Vendor not found'

EXEC DeleteProduct @ProductID = 99999;
-- Should return: Status='Error', Message='Product not found'
```

**Expected Results:**
- All stored procedures return Status/Message columns
- Error states properly identified
- Messages provide context for debugging

### 4.4 Customer Profile Tests (Continued)

**Expected Results (Get Customer Profile):
- Status: `200 OK`
- Returns customer profile information
- Excludes sensitive data (password)

#### Test Case: Update Customer Profile
```http
PUT http://localhost:5077/api/customer/update/1
Content-Type: application/json

{
  "CustomerID": 1,
  "FirstName": "UpdatedFirst",
  "LastName": "UpdatedLast",
  "EmailAddress": "updated@example.com"
}
```

**Expected Results:**
- Status: `200 OK`
- Customer information updated
- DateUpdated field populated

#### Test Case: Check Customer Exists
```http
GET http://localhost:5077/api/customer/exists/test@example.com
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Boolean response indicating existence

### 4.2 Customer Account Management Tests

#### Test Case: Deactivate Customer
```http
PUT http://localhost:5077/api/customer/deactivate/1
```

**Expected Results:**
- Status: `200 OK`
- Customer IsActive set to false
- Customer cannot login after deactivation

## 5. Vendor Management Testing

### 5.1 Vendor Retrieval Tests

#### Test Case: Get All Vendors
```http
GET http://localhost:5077/api/vendors
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns all vendors from AP database
- Includes contact information and status

#### Test Case: Get Vendor by ID
```http
GET http://localhost:5077/api/vendors/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK` (if exists)
- Status: `404 Not Found` (if doesn't exist)

### 5.2 Vendor Management Tests

#### Test Case: Add New Vendor
```http
POST http://localhost:5077/api/vendors/add
Content-Type: application/json

{
  "VendorName": "Test Music Supply",
  "VendorAddress1": "123 Music St",
  "VendorCity": "Nashville",
  "VendorState": "TN",
  "VendorZipCode": "37203",
  "VendorPhone": "615-555-0123",
  "VendorContactFName": "John",
  "VendorContactLName": "Smith",
  "VendorEmail": "john@testmusicsupply.com",
  "VendorPassword": "VendorPass123"
}
```

**Expected Results:**
- Status: `200 OK`
- Vendor created in AP.Vendors table
- IsActive set to true by default

#### Test Case: Update Vendor
```http
PUT http://localhost:5077/api/vendors/update/1
Content-Type: application/json

{
  "VendorID": 1,
  "VendorName": "Updated Music Supply",
  "VendorPhone": "615-555-9999"
}
```

**Expected Results:**
- Status: `200 OK`
- Vendor information updated

## 6. Invoice Management Testing

### 6.1 Invoice Retrieval Tests

#### Test Case: Get Invoice by ID
```http
GET http://localhost:5077/api/invoices/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Returns invoice with line items
- Includes GL account information

#### Test Case: Get Invoice Details
```http
GET http://localhost:5077/api/invoices/1/details
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Detailed invoice breakdown with line items
- Account descriptions included

## 7. Dashboard Testing

### 7.1 Customer Dashboard Tests

#### Test Case: Get Customer Dashboard
```http
GET http://localhost:5077/api/dashboard/customer/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Customer order history and account summary
- Recent orders and account status

### 7.2 Vendor Dashboard Tests

#### Test Case: Get Vendor Dashboard
```http
GET http://localhost:5077/api/dashboard/vendor/1
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- Vendor invoice summary and contact information
- Outstanding invoices and payment status

### 7.3 Admin Dashboard Tests

#### Test Case: Get Admin Dashboard
```http
GET http://localhost:5077/api/dashboard/admin
Accept: application/json
```

**Expected Results:**
- Status: `200 OK`
- System-wide metrics and statistics
- Vendor summaries and product summaries

## 8. Database Integration Testing

### 8.1 Stored Procedure Tests

#### Test Case: Customer Registration Procedure
```sql
EXEC CustomerRegister 
    @EmailAddress='testdb@example.com', 
    @Password='TestPass123', 
    @FirstName='Database', 
    @LastName='Test'
```

**Expected Results:**
- New customer record created
- Duplicate email handling (returns CustomerID = -1)
- Required fields validation

#### Test Case: Product Management Procedures
```sql
-- Test product addition
EXEC AddProduct 
    @CategoryID=1, 
    @ProductCode='TESTPROD', 
    @ProductName='Test Product',
    @Description='Test Description',
    @ListPrice=199.99,
    @DiscountPercent=10.00

-- Test product retrieval
EXEC GetAllProducts
EXEC GetProductById @ProductID=1

-- Test product updates
EXEC UpdateProduct @ProductID=1, @ProductName='Updated Name'
```

**Expected Results:**
- All procedures execute successfully
- Data integrity maintained
- Proper error handling

### 8.2 Data Integrity Tests

#### Test Case: Foreign Key Constraints
- Attempt to insert product with invalid CategoryID
- Attempt to create order with invalid CustomerID
- Verify referential integrity maintained

#### Test Case: Default Value Testing
- Verify IsActive defaults to 1 for new records
- Verify DateAdded/DateUpdated populated correctly
- Verify constraint violations handled properly

## 9. Error Handling & Validation Testing

### 9.1 Input Validation Tests

#### Test Case: Invalid Request Bodies
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "",
  "Password": "",
  "Role": "invalid_role"
}
```

**Expected Results:**
- Status: `400 Bad Request`
- Appropriate error messages
- No system crashes or exceptions

#### Test Case: SQL Injection Prevention
```http
POST http://localhost:5077/api/auth/login
Content-Type: application/json

{
  "EmailAddress": "test@example.com'; DROP TABLE Customers; --",
  "Password": "password",
  "Role": "customer"
}
```

**Expected Results:**
- Status: `401 Unauthorized` or `400 Bad Request`
- No SQL injection successful
- Database remains intact

### 9.2 Error Response Testing

#### Test Case: 404 Not Found
```http
GET http://localhost:5077/api/products/99999
```

**Expected Results:**
- Status: `404 Not Found`
- Appropriate error message
- Consistent error format

#### Test Case: Server Error Handling
- Test database connection failures
- Test malformed stored procedure calls
- Verify graceful error handling

## 10. Performance Testing

### 10.1 Response Time Testing

#### Test Case: API Response Times
- Measure response times for all major endpoints
- Target: < 500ms for simple queries
- Target: < 2000ms for complex dashboard queries

#### Test Case: Concurrent User Testing
- Simulate multiple users accessing system simultaneously
- Test authentication under load
- Monitor database connection pooling

### 10.2 Database Performance

#### Test Case: Query Optimization
- Monitor stored procedure execution times
- Verify appropriate indexes are used
- Test large dataset performance

## 11. Security Testing

### 11.1 Authentication Security

#### Test Case: Password Security
- Verify password encryption/hashing
- Test password complexity requirements
- Validate password reset token security

#### Test Case: Role-Based Access
- Verify customers cannot access admin functions
- Verify vendors cannot access customer data
- Test unauthorized endpoint access

### 11.2 Data Protection

#### Test Case: Sensitive Data Handling
- Verify passwords not returned in responses
- Test data sanitization in API responses
- Validate input sanitization

## 12. End-to-End Workflow Testing

### 12.1 Customer Journey Tests

#### Test Case: Complete Customer Registration to Purchase
1. Register new customer account
2. Browse products and categories
3. View product details
4. Add products to cart (if implemented)
5. Complete order process
6. View order in customer dashboard

#### Test Case: Customer Support Workflow
1. Customer requests password reset
2. Receive and use reset token
3. Login with new password
4. Update profile information

### 12.2 Vendor Workflow Tests

#### Test Case: Vendor Management Lifecycle
1. Add new vendor to system
2. Vendor logs in successfully
3. View vendor dashboard
4. Process vendor invoices
5. Update vendor information

### 12.3 Admin Workflow Tests

#### Test Case: Product Management Workflow
1. Admin logs in
2. View admin dashboard
3. Add new product
4. Update product information
5. Activate/deactivate products
6. View product analytics

## 13. Pre-Configured Test Accounts

### 13.1 Test Accounts Overview

The system includes pre-configured test accounts for comprehensive demonstration and testing purposes. These accounts provide access to all user roles and demonstrate both new user experiences and populated user data.

#### Available Test Accounts

**Admin/Employee Account**
- **Purpose:** Full administrative access to test dashboard features and management functions
- **Access Level:** Complete system access including product management, customer management, vendor management, and administrative dashboard
- **Features to Test:**
  - Admin dashboard with system-wide analytics
  - Product catalog management (add, edit, activate/deactivate)
  - Customer management and viewing customer details
  - Vendor management and registration token generation
  - Invoice viewing and management

**Customer Account (New User)**
- **Purpose:** Fresh customer account to test registration and initial user experience
- **Profile Status:** Minimal data, clean slate for testing
- **Features to Test:**
  - New customer registration flow
  - First-time login experience
  - Profile setup and updates
  - Shopping and cart functionality (customers only)
  - Initial dashboard view with no order history

**Customer Account (Existing User)**
- **Purpose:** Customer with order history and profile data to demonstrate populated dashboards
- **Profile Status:** Pre-populated with orders, addresses, and account history
- **Features to Test:**
  - Customer dashboard with order history
  - Account management with existing data
  - Address management (billing/shipping)
  - Order tracking and history viewing
  - Profile updates with existing information

**Vendor Account**
- **Purpose:** Test vendor to demonstrate vendor dashboard and invoice management
- **Account Type:** Registered vendor with business information
- **Features to Test:**
  - Vendor login and dashboard access
  - Invoice viewing and details
  - Vendor profile information
  - Dashboard analytics for vendors
  - Vendor-specific functionality

### 13.2 Test Account Security

**Note:** Test account credentials are available separately for evaluation and demonstration purposes. For security reasons, passwords are not included in this documentation.

**To obtain test credentials:**
- Contact the developer directly for access details
- Credentials can be provided via secure communication for course evaluation
- Test accounts use BCrypt password hashing like production accounts

### 13.3 Test Account Features Matrix

| Account Type | Dashboard | Product Mgmt | Customer Mgmt | Vendor Mgmt | Cart | Invoices |
|--------------|-----------|--------------|---------------|-------------|------|----------|
| Admin | Admin Dashboard | Full Control | View/Manage | View/Manage | Restricted | View All |
| Customer (New) | Customer Dashboard | View Only | Own Profile | No Access | Full Access | No Access |
| Customer (Existing) | Customer Dashboard | View Only | Own Profile | No Access | Full Access | No Access |
| Vendor | Vendor Dashboard | View Only | No Access | Own Profile | Restricted | Own Invoices |

**Legend:** 
- **Dashboard:** Which dashboard the account has access to
- **Product Mgmt:** Product management capabilities (view/add/edit/activate/deactivate)
- **Customer Mgmt:** Customer management and viewing capabilities
- **Vendor Mgmt:** Vendor management and token generation capabilities
- **Cart:** Shopping cart functionality
- **Invoices:** Invoice viewing access

### 13.4 Testing Workflows with Pre-Configured Accounts

#### Admin Testing Workflow
1. Login with admin credentials
2. Access admin dashboard to view system metrics
3. Manage products (add, edit, activate/deactivate)
4. View customer list and customer details modal
5. Manage vendors and generate registration tokens
6. Review system-wide analytics

#### New Customer Testing Workflow
1. Login with new customer credentials
2. View empty customer dashboard
3. Update profile information
4. Browse product catalog (active products only)
5. Add items to shopping cart
6. View cart and test cart functionality

#### Existing Customer Testing Workflow
1. Login with existing customer credentials
2. View populated customer dashboard with order history
3. Review account information and addresses
4. Browse products and use cart
5. Demonstrate data persistence and user experience

#### Vendor Testing Workflow
1. Login with vendor credentials
2. Access vendor dashboard
3. View vendor-specific invoices
4. Review business information
5. Demonstrate vendor portal functionality

### 13.5 Sample Test Data (Non-Sensitive)

#### Product Test Data
```sql
-- Sample products for testing catalog features
-- Products with various categories, prices, and active status
SELECT ProductID, ProductName, ListPrice, IsActive 
FROM Products 
WHERE ProductCode LIKE 'TEST%' OR Description LIKE '%test%';
```

#### Category Test Data
```sql
-- Verify test categories exist
SELECT CategoryID, CategoryName FROM Categories;
```

## 14. Test Automation Scripts

### 14.1 HTTP Test File Structure
The `FinalProjectAPI.http` file provides organized test scenarios:

```http
# Authentication Tests
### Customer Login Test
POST {{FinalProjectAPI_HostAddress}}/api/auth/login

### Product Retrieval Tests  
### Get All Products
GET {{FinalProjectAPI_HostAddress}}/api/products

### Dashboard Tests
### Customer Dashboard
GET {{FinalProjectAPI_HostAddress}}/api/dashboard/customer/1
```

### 14.2 Database Test Scripts
```sql
-- Automated test procedure
CREATE PROCEDURE RunSystemTests
AS
BEGIN
    -- Test all major stored procedures
    EXEC GetCategories;
    EXEC GetAllProducts;
    EXEC GetAllVendors;
    
    -- Validate data integrity
    SELECT COUNT(*) as ProductCount FROM Products WHERE IsActive = 1;
    SELECT COUNT(*) as CustomerCount FROM Customers WHERE IsActive = 1;
    SELECT COUNT(*) as VendorCount FROM Vendors WHERE IsActive = 1;
END
```

## 15. Test Execution Schedule

### 15.1 Development Testing
- **Unit Tests:** Run after each code change
- **Integration Tests:** Daily during development
- **Database Tests:** After schema changes
- **API Tests:** After endpoint modifications

### 15.2 Pre-Deployment Testing
- **Complete Regression Testing:** All test cases
- **Performance Testing:** Load and stress tests
- **Security Testing:** Penetration testing
- **User Acceptance Testing:** Real-world scenarios

## 16. Test Reporting

### 16.1 Test Results Documentation

#### Test Case Result Format
```
Test Case ID: AUTH_001
Test Case Name: Customer Registration - Valid Data
Execution Date: [Date]
Status: PASS/FAIL
Expected Result: Customer account created successfully
Actual Result: Customer account created, CustomerID returned
Notes: All validation working correctly
```

#### Test Summary Report
- Total test cases executed
- Pass/Fail ratio
- Performance metrics
- Security test results
- Outstanding issues

### 16.2 Defect Tracking
- **Critical:** Security vulnerabilities, data loss
- **High:** Authentication failures, core functionality broken
- **Medium:** UI issues, minor data inconsistencies
- **Low:** Cosmetic issues, documentation errors

## 17. Continuous Integration Testing

### 17.1 Automated Testing Pipeline
1. **Code Commit Triggers**
   - Automated unit test execution
   - Basic API endpoint verification
   - Database connection testing

2. **Build Validation**
   - Compile-time error checking
   - Dependency validation
   - Configuration verification

3. **Deployment Testing**
   - Environment setup validation
   - Database schema verification
   - API health checks

## 18. Production Testing Considerations

### 18.1 Production Monitoring
- **API Response Times:** Monitor endpoint performance
- **Error Rates:** Track 4xx and 5xx responses
- **Database Performance:** Monitor query execution times
- **User Authentication:** Track login success/failure rates

### 18.2 Production Test Data
- Use anonymized production data for testing
- Maintain separate test databases
- Implement data refresh procedures

## Conclusion

This comprehensive testing plan ensures the My Guitar Shop Management System meets all functional, security, and performance requirements. The combination of manual testing, automated validation, and continuous monitoring provides confidence in system reliability and user experience.

The testing approach covers all user roles, business workflows, and technical components while maintaining focus on real-world usage scenarios. Regular execution of these tests throughout development and deployment phases ensures a robust, secure, and performant application.

### Recent Enhancements Testing (November 30, 2025)

The testing plan now includes validation for:

1. **GDPR-Compliant Customer Deletion**
   - Data anonymization verification
   - Order history preservation
   - Login prevention with anonymized accounts

2. **Enhanced Error Handling**
   - Stored procedure status checking
   - Error propagation from database to API
   - Proper HTTP status codes for failures

3. **Password Validation Consistency**
   - Frontend-backend validation alignment
   - Consistent rules across all password entry points
   - Support for symbols, spaces, and international characters

4. **Product Image Upload Security**
   - File type validation
   - File size enforcement (5MB limit)
   - GUID-based secure file naming
   - Category-based organization

These enhancements strengthen data privacy compliance, improve error handling and debugging, ensure consistent user experience, and add secure file upload capabilities.

---

**Related Documentation:**
- [Project Overview](ProjectOverview.md) - Complete project description
- [Setup Instructions](SetupInstructions.md) - Environment setup for testing
- [API Endpoints](APIEndpoints.md) - Detailed endpoint specifications for testing
- [SQL Design](SQLDesign.md) - Database testing procedures and validation
- [OOP Concepts Summary](OOPConceptsSummary.md) - Code architecture for testing
- [Architecture Decisions](ArchitectureDecisions.md) - System design context
- [Token Security Implementation](TokenSecurityImplementation.md) - Vendor registration testing
