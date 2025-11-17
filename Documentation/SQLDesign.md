# My Guitar Shop - SQL Database Design Documentation

## Project Information
- **Project Name:** My Guitar Shop Management System
- **Author:** Leena Komenski  
- **Course:** Final Project API Development
- **Date:** November 2025
- **Database System:** Microsoft SQL Server

## Overview

The My Guitar Shop Management System utilizes a dual-database architecture to separate customer-facing e-commerce operations from vendor/accounts payable management. This design follows industry best practices for data segregation and security.

## Database Architecture

### Database Structure
The system employs two distinct databases:

1. **MyGuitarShop** - Customer-facing e-commerce operations
2. **AP (Accounts Payable)** - Vendor and invoice management

### Connection Configuration
```json
{
  "ConnectionStrings": {
    "MyGuitarShop": "Server=.\\SQLEXPRESS;Database=MyGuitarShop;Trusted_Connection=true;TrustServerCertificate=true;",
    "AP": "Server=.\\SQLEXPRESS;Database=AP;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "DbProvider": "SqlServer"
}
```

## MyGuitarShop Database Schema

### Primary Tables

#### 1. Categories Table
```sql
-- Core product categorization
Categories
├── CategoryID (PK, INT, IDENTITY)
├── CategoryName (NVARCHAR(255))
└── Description (TEXT)
```

**Purpose:** Organizes products into logical categories (Guitars, Drums, Basses, etc.)

#### 2. Products Table
```sql
-- Product inventory and details
Products
├── ProductID (PK, INT, IDENTITY)
├── CategoryID (FK, INT) → Categories.CategoryID
├── ProductCode (VARCHAR(10))
├── ProductName (NVARCHAR(255))
├── Description (TEXT)
├── ListPrice (MONEY)
├── DiscountPercent (MONEY)
├── ImageURL (NVARCHAR(500))
├── IsActive (BIT, DEFAULT 1)
├── DateCreated (DATETIME)
├── DateAdded (DATETIME)
└── DateUpdated (DATETIME)
```

**Purpose:** Stores complete product catalog with pricing, descriptions, and inventory status

#### 3. Customers Table
```sql
-- Customer account information
Customers
├── CustomerID (PK, INT, IDENTITY)
├── EmailAddress (NVARCHAR(255))
├── Password (NVARCHAR(255))
├── FirstName (NVARCHAR(50))
├── LastName (NVARCHAR(50))
├── ShippingAddressID (INT)
├── BillingAddressID (INT)
├── IsActive (BIT, DEFAULT 1)
├── DateUpdated (DATETIME)
└── ResetToken (NVARCHAR(200))
```

**Purpose:** Manages customer accounts, authentication, and profile data

#### 4. Orders Table
```sql
-- Customer order tracking
Orders
├── OrderID (PK, INT, IDENTITY)
├── CustomerID (FK, INT) → Customers.CustomerID
├── OrderDate (DATETIME)
├── ShipAddressID (INT)
├── BillingAddressID (INT)
└── OrderStatus (NVARCHAR(50))
```

**Purpose:** Tracks customer orders and shipping information

#### 5. OrderItems Table
```sql
-- Individual items within orders
OrderItems
├── OrderItemID (PK, INT, IDENTITY)
├── OrderID (FK, INT) → Orders.OrderID
├── ProductID (FK, INT) → Products.ProductID
├── ItemPrice (MONEY)
├── DiscountAmount (MONEY)
└── Quantity (INT)
```

**Purpose:** Details of products included in each order

### Table Relationships

```
Categories (1) ──────→ (∞) Products
                              │
Customers (1) ──────→ (∞) Orders (1) ──────→ (∞) OrderItems
                              │                      │
                              └──────────────────────→ Products (∞)
```

### Key Constraints and Indexes

- **Primary Keys:** All tables have identity-based primary keys
- **Foreign Keys:** Enforce referential integrity across related tables
- **Default Constraints:** 
  - `DF_Products_IsActive DEFAULT (1)`
  - `DF_Customers_IsActive DEFAULT (1)`
- **Data Integrity:** Email uniqueness enforced in stored procedures

## AP (Accounts Payable) Database Schema

### Primary Tables

#### 1. Vendors Table
```sql
-- Vendor/supplier information
Vendors
├── VendorID (PK, INT, IDENTITY)
├── VendorName (NVARCHAR(50))
├── VendorAddress1 (NVARCHAR(50))
├── VendorAddress2 (NVARCHAR(50))
├── VendorCity (NVARCHAR(50))
├── VendorState (NCHAR(2))
├── VendorZipCode (NVARCHAR(20))
├── VendorPhone (NVARCHAR(50))
├── VendorContactLName (NVARCHAR(50))
├── VendorContactFName (NVARCHAR(50))
├── VendorEmail (NVARCHAR(255))
├── VendorPassword (NVARCHAR(255))
├── DefaultTermsID (INT)
├── DefaultAccountNo (NVARCHAR(50))
├── IsActive (BIT, DEFAULT 1)
└── DateUpdated (DATETIME)
```

**Purpose:** Comprehensive vendor management and authentication

#### 2. Invoices Table
```sql
-- Vendor invoice tracking
Invoices
├── InvoiceID (PK, INT, IDENTITY)
├── VendorID (FK, INT) → Vendors.VendorID
├── InvoiceNumber (NVARCHAR(50))
├── InvoiceDate (DATE)
├── InvoiceTotal (MONEY)
├── PaymentTotal (MONEY, DEFAULT 0)
├── CreditTotal (MONEY, DEFAULT 0)
├── TermsID (INT)
└── InvoiceDueDate (DATE)
```

**Purpose:** Tracks vendor invoices and payment status

#### 3. InvoiceLineItems Table
```sql
-- Detailed line items for invoices
InvoiceLineItems
├── InvoiceID (FK, INT) → Invoices.InvoiceID
├── InvoiceSequence (INT)
├── AccountNo (NVARCHAR(50)) → GLAccounts.AccountNo
├── InvoiceLineItemAmount (MONEY)
└── InvoiceLineItemDescription (NVARCHAR(100))
```

**Purpose:** Detailed breakdown of invoice charges and expense categories

#### 4. GLAccounts Table
```sql
-- General Ledger account codes
GLAccounts
├── AccountNo (PK, NVARCHAR(50))
└── AccountDescription (NVARCHAR(100))
```

**Purpose:** Chart of accounts for expense categorization

### AP Database Relationships

```
Vendors (1) ──────→ (∞) Invoices (1) ──────→ (∞) InvoiceLineItems
                                                     │
GLAccounts (1) ──────────────────────────────────→ (∞)
```

## Stored Procedures Architecture

### Naming Conventions
- **Verb-Object Pattern:** `GetAllProducts`, `AddProduct`, `UpdateCustomer`
- **Role-Based Actions:** `CustomerLogin`, `VendorLogin`, `EmployeeLogin`
- **Status Management:** `ActivateProduct`, `DeactivateVendor`

### MyGuitarShop Stored Procedures

#### Product Management
```sql
-- Product Operations
GetAllProducts           -- Retrieves all products with details
GetProductById          -- Gets specific product information
GetProductsByCategory   -- Filters products by category
GetFeaturedProducts     -- Returns featured/promoted products
GetBestSellers          -- Analytics for top-selling products
AddProduct             -- Creates new product entries
UpdateProduct          -- Modifies existing product data
DeleteProductById      -- Removes products (logical deletion)
ActivateProduct        -- Enables products for sale
DeactivateProduct      -- Disables products from sale
```

#### Customer Management
```sql
-- Customer Operations
CustomerRegister       -- Creates new customer accounts
CustomerLogin         -- Authenticates customer access
GetCustomerProfile    -- Retrieves customer information
UpdateCustomerProfile -- Modifies customer data
GetCustomerDashboard  -- Customer analytics and order history
DeactivateCustomer    -- Disables customer accounts
DeleteCustomer        -- Removes customer records
CheckCustomerExists   -- Validates customer existence
```

#### Order Processing
```sql
-- Order Operations
CreateOrder           -- Initiates new customer orders
CreateOrderItem       -- Adds products to orders
GetOrderHistory       -- Retrieves customer order data
```

#### Authentication & Security
```sql
-- Security Operations
CustomerResetPassword     -- Password recovery process
SavePasswordResetToken    -- Stores password reset tokens
```

### AP Database Stored Procedures

#### Vendor Management
```sql
-- Vendor Operations
GetAllVendors         -- Retrieves all vendor information
GetVendorById        -- Gets specific vendor details
GetVendorDashboard   -- Vendor analytics and invoice summary
AddVendor           -- Creates new vendor accounts
UpdateVendor        -- Modifies vendor information
DeleteVendorById    -- Removes vendor records
ActivateVendor      -- Enables vendor accounts
DeactivateVendor    -- Disables vendor access
VendorLogin         -- Vendor authentication
```

#### Invoice Management
```sql
-- Invoice Operations
GetInvoiceById      -- Retrieves complete invoice details
GetInvoiceDetail    -- Gets invoice with line item breakdown
CreateInvoice       -- Processes new vendor invoices
```

#### Dashboard & Analytics
```sql
-- Reporting Operations
GetEmployeeDashboard  -- Administrative analytics and reporting
```

## Data Access Layer Implementation

### Repository Pattern
The system implements a repository pattern for data access abstraction:

```csharp
// Interface abstraction
public interface IDataRepository
{
    Task<IEnumerable<T>> ExecuteStoredProcedureAsync<T>(string procedureName, object parameters);
    Task<T> ExecuteStoredProcedureSingleAsync<T>(string procedureName, object parameters);
}

// Factory pattern for repository creation
public interface IDataRepositoryFactory
{
    IDataRepository CreateRepository(string connectionName);
}
```

### Database Provider Support
- **Primary:** SQL Server
- **Extensible:** MySQL support through factory pattern
- **Connection Management:** Named connection strings for multiple databases

## Security and Data Integrity

### Authentication Security
- **Password Storage:** Encrypted password storage (implementation-dependent)
- **Token-Based Reset:** Secure password reset using unique tokens
- **Role-Based Access:** Separate authentication for customers, vendors, and employees

### Data Validation
- **Email Uniqueness:** Enforced through stored procedure logic
- **Required Fields:** NOT NULL constraints on essential fields
- **Data Types:** Appropriate data types for all fields (MONEY for currency, BIT for boolean)

### Transaction Management
- **ACID Compliance:** All operations maintain data consistency
- **Rollback Support:** Error handling with transaction rollback capabilities
- **Concurrent Access:** SQL Server handles concurrent user access

## Performance Considerations

### Indexing Strategy
- **Primary Keys:** Clustered indexes on all primary keys
- **Foreign Keys:** Non-clustered indexes for relationship optimization
- **Search Fields:** Indexes on frequently queried fields (EmailAddress, ProductName)

### Query Optimization
- **Stored Procedures:** Pre-compiled execution plans for better performance
- **Parameter Optimization:** Parameterized queries prevent SQL injection
- **Result Set Limitation:** Efficient data retrieval with appropriate WHERE clauses

### Scalability Features
- **Database Separation:** Independent scaling of customer vs. vendor operations
- **Connection Pooling:** Efficient resource utilization through connection management
- **Caching Potential:** Repository pattern supports caching layer implementation

## Data Migration and Maintenance

### Table Alterations
The system includes comprehensive table alteration scripts:

- **AlterCustomerTable.sql:** Adds `IsActive`, `DateUpdated`, and `ResetToken` fields
- **AlterProductsTable.sql:** Adds `IsActive`, `DateCreated`, `DateAdded`, and `ImageURL` fields
- **AlterVendorTable.sql:** Adds `VendorEmail`, `VendorPassword`, `IsActive`, and `DateUpdated` fields

### Data Population
- **Sample Data:** Image URL updates for product demonstration
- **Default Values:** Appropriate defaults for new boolean fields
- **Data Consistency:** Bulk updates to maintain data integrity

## Backup and Recovery Strategy

### Database Backup
```sql
-- Full database backup example
BACKUP DATABASE MyGuitarShop 
TO DISK = 'C:\Backups\MyGuitarShop_Full.bak'
WITH FORMAT, DESCRIPTION = 'Full backup of MyGuitarShop';

BACKUP DATABASE AP 
TO DISK = 'C:\Backups\AP_Full.bak'
WITH FORMAT, DESCRIPTION = 'Full backup of AP database';
```

### Recovery Planning
- **Regular Backups:** Automated full and incremental backups
- **Point-in-Time Recovery:** Transaction log backup strategy
- **Disaster Recovery:** Database restoration procedures documented

## Future Enhancements

### Potential Schema Improvements
1. **Address Management:** Dedicated address tables for customer/vendor addresses
2. **Product Variants:** Support for product options (size, color, model)
3. **Inventory Tracking:** Quantity on hand and reserved stock management
4. **Price History:** Historical pricing data for analytics
5. **Customer Reviews:** Product review and rating system

### Performance Enhancements
1. **Partitioning:** Large table partitioning for historical data
2. **Replication:** Read replica setup for reporting and analytics
3. **Compression:** Data compression for archived records
4. **Archival Strategy:** Historical data archival process

## Conclusion

The SQL database design for the My Guitar Shop Management System demonstrates professional-level database architecture with proper normalization, referential integrity, and security considerations. The dual-database approach provides excellent separation of concerns while the extensive stored procedure library ensures consistent and secure data access patterns.

The design supports both current functional requirements and provides a solid foundation for future enhancements and scaling needs. The combination of proper indexing, transaction management, and comprehensive documentation makes this database design suitable for production deployment and long-term maintenance.

---

**Related Documentation:**
- [Project Overview](ProjectOverview.md) - Complete project description
- [Setup Instructions](SetupInstructions.md) - Database setup procedures  
- [API Endpoints](APIEndpoints.md) - Database-connected API documentation
- [Testing Plan](TestingPlan.md) - Database testing procedures
