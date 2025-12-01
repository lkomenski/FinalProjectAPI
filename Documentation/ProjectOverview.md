# My Guitar Shop - Final Project Overview

## Project Information
- **Project Name:** My Guitar Shop Management System
- **Author:** Leena Komenski
- **Course:** Final Project API Development
- **Date:** November 2025
- **Technology Stack:** ASP.NET Core Web API, React.js, SQL Server

## Executive Summary

The My Guitar Shop Management System is a comprehensive e-commerce and business management platform designed for a guitar retail business. The system provides a full-featured web application with separate interfaces for customers, vendors, and administrators, enabling efficient management of products, orders, invoices, and user accounts.

## Project Architecture

### Backend (ASP.NET Core Web API)
- **Framework:** .NET 9.0
- **Architecture:** Model-View-Controller (MVC) with Repository Pattern
- **Database:** SQL Server with stored procedures
- **Authentication:** BCrypt password hashing (BCrypt.Net-Next) with role-based authentication system
- **API Documentation:** Swagger/OpenAPI integration
- **Security:** BCrypt work factor 12 for password encryption

### Frontend (React.js Application)
- **Framework:** React.js 19.x with React Router 7.x
- **State Management:** Context API for cart and user state
- **UI Components:** Custom responsive design with react-slick carousels
- **Navigation:** Protected routes based on user roles with automatic dashboard redirection
- **Charts & Visualization:** Recharts library for dashboard analytics and data visualization
- **Styling:** Modular CSS architecture with Dashboard.css, ManagementPage.css, and modal.css
- **Testing:** React Testing Library with Jest

### Database Design
- **Primary Database:** MyGuitarShop (customer-facing operations)
- **Secondary Database:** AP (Accounts Payable for vendor management)
- **Data Access:** Repository pattern with factory implementation
- **Stored Procedures:** Over 30 custom stored procedures for business logic

## Core Features

### Customer Management
- **User Registration & Authentication:** Secure customer account creation and login with BCrypt password encryption
- **Profile Management:** Update personal information, addresses, and preferences
- **Shopping Cart:** Add products, manage quantities, and checkout (restricted to customers only)
- **Order History:** View past purchases and order status
- **Password Security:** Complete password reset flow via email and in-app password change functionality
- **Password Validation:** Consistent frontend-backend validation (8+ characters with at least one digit)
- **Account Management:** Profile updates with email and personal information
- **Role-Based Cart Restrictions:** Vendors and administrators cannot access shopping cart functionality
- **GDPR-Compliant Deletion:** Customer data anonymization preserving order history for compliance
- **Data Privacy:** Customer deletion anonymizes personal data while maintaining referential integrity

### Product Catalog Management
- **Inventory Management:** Complete CRUD operations for products
- **Category Organization:** Products organized by musical instrument categories
- **Featured Products:** Highlight special or promotional items
- **Best Sellers Tracking:** Analytics-driven product recommendations
- **Image Management:** Product photos and galleries with carousel displays
- **Image Upload System:** Secure product image upload with file validation (max 5MB, .jpg/.png/.gif/.webp)
- **Organized Storage:** Images categorized by product type (guitars, basses, drums) in public directory
- **Stock Management:** Inventory tracking and availability
- **Product Activation:** Activate/deactivate products without deletion
- **Visibility Control:** Inactive products automatically hidden from customer view
- **Search Restriction:** Inactive products excluded from search results and category filters
- **Direct Access Prevention:** Inactive products cannot be accessed via URL by customers
- **Admin Override:** Administrators can view and manage all products regardless of status

### Vendor Management
- **Vendor Registration:** Dedicated registration form with business information and BCrypt password security
- **Vendor Profiles:** Maintain detailed vendor information including contact and business details
- **Invoice Management:** Track vendor invoices, payment terms, and due dates
- **Account Status:** Activate/deactivate vendor accounts
- **Contact Management:** Vendor communication and contact details
- **Dashboard Analytics:** Vendor-specific sales, revenue tracking, and invoice summaries
- **Vendor Authentication:** Secure login with BCrypt password verification

### Administrative Dashboard
- **System Overview:** Key performance indicators and metrics with real-time refresh capabilities
- **User Management:** Manage customer and vendor accounts with status controls
- **Sales Analytics:** Revenue tracking and reporting with interactive Recharts visualizations
- **Inventory Reports:** Stock levels and product performance
- **Invoice Tracking:** Outstanding invoices and payment status
- **Customer Detail Modals:** View comprehensive customer information including addresses and order history
- **Product Visibility Management:** Control product active/inactive status
- **Dashboard Navigation:** Role-based automatic redirection on login

## User Roles & Permissions

### Customer Users
- Browse and search product catalog (active products only)
- Add products to shopping cart
- Complete purchase transactions
- View order history and status
- Manage personal profile and addresses
- Access customer dashboard
- Redirected to home page on login

### Vendor Users
- View and manage vendor profile
- Access invoice history and details with payment terms
- Track payment status, due dates, and terms
- View vendor-specific dashboard metrics and analytics
- Update contact and business information
- Manage vendor account settings
- View sales and revenue data
- Cannot add items to cart or make purchases
- Redirected to vendor dashboard on login

### Administrator/Employee Users
- Full system administration access
- Manage all users, products, and vendors
- Access comprehensive analytics and reports
- Process orders and manage inventory
- Handle customer service and support issues
- Control product visibility through active/inactive status
- View all products including inactive ones
- Cannot add items to cart
- Redirected to admin dashboard on login

## Technical Implementation

### Controllers & API Endpoints
1. **AuthController** - Universal authentication, registration, and password management for all user roles (customers, vendors, admins)
2. **CustomerController** - Customer profile management, addresses, account operations, and GDPR-compliant deletion
3. **ProductsController** - Product catalog operations with activation/deactivation and secure image upload
4. **CategoriesController** - Product category management
5. **VendorsController** - Vendor management with token-based registration
6. **InvoicesController** - Invoice and payment tracking with detailed vendor invoices
7. **DashboardController** - Analytics and reporting for customer, vendor, and admin roles
8. **PasswordResetController** - Secure password recovery system with token generation

**Enhanced Error Handling:** All controllers implement stored procedure status checking for proper error propagation from database to API layer

### Data Models
- **Customer** - User account and profile information
- **Product** - Product details, pricing, and inventory
- **Category** - Product categorization system
- **Vendor** - Supplier and manufacturer information with authentication
- **VendorRegisterRequest** - Vendor registration data transfer object
- **Invoice** - Vendor invoicing and payment tracking
- **Dashboard Models** - Analytics and reporting data structures (CustomerDashboard, VendorDashboard, AdminDashboard)
- **LoginRequest/LoginResponse** - Authentication data transfer objects
- **ChangePasswordRequest** - Password change data transfer object
- **ResetPasswordDto/ResetRequestDto** - Password reset data transfer objects
- **Address** - Customer address management

### Security Features
- **Password Encryption** - BCrypt password hashing with BCrypt.Net-Next package (work factor 12)
- **Password Verification** - BCrypt.Verify for all authentication attempts
- **Password Validation Consistency** - Aligned frontend-backend validation (8+ characters, at least one digit)
- **Role-Based Access Control** - User permission management for customer/vendor/admin roles
- **Session Management** - Secure user session handling with token-based authentication
- **Input Validation** - Data sanitization and validation on all endpoints
- **Error Handling** - Comprehensive exception management without exposing sensitive data
- **Enhanced Error Propagation** - Stored procedures return Status/Message for proper error handling
- **SQL Injection Prevention** - Parameterized stored procedures for all database operations
- **Password Requirements** - Minimum 8 characters with at least one digit
- **Password Change Flow** - Verify old password before allowing change with BCrypt
- **Password Reset Flow** - Secure token-based reset with email verification
- **File Upload Security** - Image upload validation (type, size, filename sanitization)
- **GDPR Compliance** - Customer data anonymization with preserved referential integrity

## Business Logic

### Product Management
- Products can be activated/deactivated without deletion
- Inactive products automatically hidden from customer view
- Inactive products excluded from search results and category filters
- Inactive products cannot be accessed directly via URL by customers
- Administrators can view and manage all products regardless of status
- Secure image upload with validation (file type, size, GUID-based naming)
- Images organized by category in public directory for frontend access
- Inventory tracking with stock levels
- Dynamic pricing with discount percentages
- Category-based organization and filtering
- Featured product promotion system
- Best seller analytics and recommendations

### Data Privacy & Compliance
- **GDPR-Compliant Customer Deletion:** Anonymizes personal data while preserving order history
- **Data Anonymization:** Email, password, name, and phone replaced with generic values
- **Referential Integrity:** CustomerID preserved for foreign key relationships
- **Audit Trail:** DateUpdated timestamp maintains deletion record
- **Reversible Process:** Accounts can be reactivated if needed
- **Order Preservation:** Financial and transaction records remain intact for legal compliance

### Order Processing
- Shopping cart functionality with session persistence
- Order creation and tracking
- Customer order history
- Integration with inventory management

### Vendor Relations
- Comprehensive vendor profile management
- Invoice tracking and payment terms
- Vendor performance analytics
- Account status management (active/inactive)

### Financial Management
- Sales revenue tracking
- Outstanding invoice monitoring
- Vendor payment management
- Financial reporting and analytics

## Development Standards

### Code Organization
- **Repository Pattern** - Data access abstraction
- **Factory Pattern** - Database connection management
- **Separation of Concerns** - Clean architecture principles
- **Dependency Injection** - Service registration and management
- **Error Handling** - Consistent exception management

### Database Standards
- **Stored Procedures** - All database operations use stored procedures
- **Parameter Validation** - SQL injection prevention
- **Transaction Management** - Data integrity assurance
- **Normalized Design** - Efficient database structure

### API Standards
- **RESTful Design** - Standard HTTP methods and status codes
- **JSON Communication** - Consistent data format
- **Error Responses** - Standardized error handling
- **Documentation** - Comprehensive API documentation

## Testing & Quality Assurance

### API Testing
- **HTTP Client Testing** - Comprehensive endpoint testing with FinalProjectAPI.http file
- **Error Scenario Testing** - Exception handling validation and stored procedure status checking
- **Authentication Testing** - BCrypt security verification and login flow testing
- **Data Validation Testing** - Input validation checks with frontend-backend consistency
- **Password Security Testing** - BCrypt hashing and verification testing
- **Password Validation Testing** - Consistent validation rules across all entry points
- **Registration Flow Testing** - Customer and vendor registration validation
- **File Upload Testing** - Image upload validation (type, size, security)
- **GDPR Compliance Testing** - Customer deletion and data anonymization verification

### Database Testing
- **Stored Procedure Testing** - Individual procedure validation
- **Data Integrity Testing** - Referential integrity checks
- **Performance Testing** - Query optimization validation
- **Password Storage Testing** - Verify BCrypt hash storage

### Frontend Testing
- **React Testing Library** - Component testing with Jest
- **User Interaction Testing** - Form submissions and user flows
- **Integration Testing** - API integration and data flow testing

## Future Enhancements

### Identified Improvements & Next Steps

#### Code Quality & Architecture
- **CSS Refactoring:** Remove remaining inline styles and consolidate CSS files for better maintainability
- **Stylesheet Optimization:** Reorganize CSS architecture to reduce file complexity and improve efficiency
- **Component Styling:** Establish consistent styling patterns across all React components
- **Style Guide:** Create comprehensive style guide for consistent UI/UX patterns

#### Security & Access Control
- **Administrator Account Management:** Implement secure workflow for creating and managing admin accounts
- **Multi-Factor Authentication:** Add optional 2FA for enhanced account security
- **Role Permission Granularity:** Fine-tune access controls for different administrative levels
- **Audit Logging:** Track all administrative actions and changes

#### Vendor Features
- **Vendor Profile Editing:** Allow vendors to request profile updates
- **Admin Approval Workflow:** Submit vendor information changes for administrator review before applying
- **Change History Tracking:** Maintain audit trail of vendor profile modifications
- **Notification System:** Alert administrators of pending vendor update requests

### Potential Additional Features
- **Payment Processing** - Credit card and PayPal integration
- **Shipping Integration** - Real-time shipping calculations and tracking
- **Email Notifications** - Order confirmations, password resets, and updates
- **Advanced Analytics** - Business intelligence dashboards with charts and graphs
- **Mobile Application** - Native mobile app development for iOS and Android
- **Inventory Automation** - Automatic reorder points and supplier integration
- **Two-Factor Authentication** - Enhanced security with 2FA
- **Social Media Integration** - Social login and product sharing
- **Product Reviews** - Customer reviews and ratings system
- **Wishlist Feature** - Save products for later purchase

### Scalability Considerations
- **Caching Implementation** - Redis or in-memory caching
- **Load Balancing** - Multiple server deployment
- **Database Optimization** - Query performance tuning
- **CDN Integration** - Static asset delivery optimization

## Project Deliverables

### Documentation
- [API Endpoints Documentation](APIEndpoints.md) - Complete API reference with all endpoints
- [Database Design Documentation](SQLDesign.md) - Database schema and stored procedures
- [Setup Instructions](SetupInstructions.md) - Installation and configuration guide
- [Testing Plan](TestingPlan.md) - Comprehensive testing procedures and strategies
- [OOP Concepts Summary](OOPConceptsSummary.md) - Object-oriented programming concepts implemented
- [Architecture Decisions](ArchitectureDecisions.md) - Key architectural decisions and design patterns
- [Token Security Implementation](TokenSecurityImplementation.md) - Vendor registration token system documentation

### Code Deliverables
- Complete ASP.NET Core Web API application (.NET 9.0)
- React.js 19.x client application with React Router 7.x and breadcrumb navigation
- SQL Server database with stored procedures
- HTTP testing file for API validation (FinalProjectAPI.http)
- BCrypt.Net-Next integration for password security
- React Testing Library test suite
- Token-based vendor registration system
- Comprehensive documentation suite

### Database Assets
- Database creation scripts
- Stored procedure implementations
- Sample data population scripts
- Database relationship diagrams

## Conclusion

The My Guitar Shop Management System represents a comprehensive solution for e-commerce and business management in the musical instrument retail industry. The project demonstrates advanced web development skills, database design expertise, and modern software architecture principles with enterprise-grade security using BCrypt password encryption.

The system provides a solid foundation for a real-world guitar retail business while showcasing professional development practices and coding standards. Key technical achievements include:

- **Modern Stack:** Utilizes the latest versions of .NET 9.0, React 19.x, and React Router 7.x
- **Security Best Practices:** Implements BCrypt password hashing with work factor 12 for industry-standard security
- **Token-Based Vendor Registration:** Secure 48-hour expiring tokens with one-time use for vendor account creation
- **Consolidated Authentication:** Single AuthController handles all authentication flows for customers, vendors, and administrators
- **Comprehensive Testing:** Includes React Testing Library integration for frontend testing
- **Role-Based Architecture:** Separate authentication flows for customers, vendors, and administrators
- **Professional API Design:** RESTful endpoints with comprehensive documentation and error handling
- **Enhanced Error Propagation:** Stored procedure status checking ensures proper error handling throughout the stack
- **Scalable Database Design:** Stored procedure architecture with proper separation of concerns
- **Enhanced UX:** Breadcrumb navigation and modal-based secure token display
- **GDPR Compliance:** Customer data anonymization while preserving financial records and referential integrity
- **Validation Consistency:** Aligned password validation rules across frontend and backend (November 30, 2025)
- **Secure File Upload:** Product image upload with comprehensive validation and organized storage

Recent Enhancements (November 30, 2025):
- **Data Privacy:** GDPR-compliant customer deletion with anonymization strategy
- **Error Handling:** Enhanced stored procedure status checking across all controllers
- **Password Validation:** Frontend-backend consistency for better user experience
- **Image Management:** Secure product image upload system with validation

The modular design, comprehensive feature set, and extensible architecture make this system suitable for both educational demonstration and potential commercial deployment with additional enhancements. The implementation of BCrypt password security, GDPR compliance, and modern frontend frameworks demonstrates adherence to current industry standards and best practices.
