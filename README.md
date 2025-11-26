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
- **Authentication:** BCrypt password hashing with role-based authentication system
- **API Documentation:** Swagger/OpenAPI integration
- **Security:** BCrypt.Net-Next package for password encryption

### Frontend (React.js Application)
- **Framework:** React.js 19.x with React Router 7.x
- **State Management:** Context API for cart and user state
- **UI Components:** Custom responsive design with react-slick carousels
- **Navigation:** Protected routes based on user roles with automatic dashboard redirection
- **Charts & Visualization:** Recharts library for dashboard analytics
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
- **Role-Based Cart Access:** Vendors and administrators cannot add items to cart

### Product Catalog Management
- **Inventory Management:** Complete CRUD operations for products
- **Category Organization:** Products organized by musical instrument categories
- **Featured Products:** Highlight special or promotional items
- **Best Sellers Tracking:** Analytics-driven product recommendations
- **Image Management:** Product photos and galleries
- **Stock Management:** Inventory tracking and availability
- **Product Status Control:** Active/inactive status management - inactive products are hidden from customers
- **Search & Filter:** Active products are searchable and filterable by category

### Vendor Management
- **Vendor Registration:** Onboard new suppliers and manufacturers with dedicated registration form
- **Vendor Profiles:** Maintain detailed vendor information and business details
- **Invoice Management:** Track vendor invoices, payment terms, and due dates
- **Account Status:** Activate/deactivate vendor accounts
- **Contact Management:** Vendor communication and contact details
- **Dashboard Analytics:** Vendor-specific sales and revenue tracking
- **Restricted Access:** Vendors cannot access shopping cart or make purchases

### Administrative Dashboard
- **System Overview:** Key performance indicators and metrics with real-time refresh capabilities
- **User Management:** Manage customer and vendor accounts with status controls
- **Sales Analytics:** Revenue tracking and reporting with interactive charts
- **Inventory Reports:** Stock levels and product performance
- **Invoice Tracking:** Outstanding invoices and payment status
- **Customer Details:** View customer information, addresses, and order history
- **Product Management:** Control product visibility and inventory status
- **Role-Based Navigation:** Automatic dashboard redirection on login

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
- Access invoice history and details
- Track payment status and terms
- View vendor-specific dashboard metrics
- Update contact and business information
- Cannot add items to cart or make purchases
- Redirected to vendor dashboard on login

### Administrator/Employee Users
- Full system administration access
- Manage all users, products, and vendors
- Access comprehensive analytics and reports
- Process orders and manage inventory
- Handle customer service and support issues
- Control product visibility (active/inactive status)
- View all products including inactive ones
- Cannot add items to cart
- Redirected to admin dashboard on login

## Technical Implementation

### Controllers & API Endpoints
1. **AuthController** - Universal authentication with BCrypt password verification
2. **CustomerController** - Customer account management with password change functionality
3. **ProductsController** - Product catalog operations with image management
4. **CategoriesController** - Product category management
5. **VendorsController** - Vendor management with registration support
6. **InvoicesController** - Invoice and payment tracking
7. **DashboardController** - Analytics and reporting for all user roles
8. **PasswordResetController** - Secure password recovery system

### Data Models

**Core Business Models:**
- **Customer** - User account and profile information
- **Product** - Product details, pricing, and inventory status
- **Category** - Product categorization system
- **Vendor** - Supplier and manufacturer information with registration token support
- **Address** - Customer shipping and billing address information

**Dashboard & Analytics Models:**
- **AdminDashboard** - System-wide metrics and analytics
- **CustomerDashboard** - Customer-specific order history and account summary
- **VendorDashboard** - Vendor-specific invoice and performance data

**Authentication & Security Models:**
- **LoginRequest** - User authentication credentials
- **LoginResponse** - Authentication response with user details and role
- **CustomerRegistrationRequest** - New customer account registration
- **VendorRegisterRequest** - Vendor registration with token validation
- **ChangePasswordRequest** - Password change functionality
- **ResetPasswordDto** - Password reset data transfer
- **ResetRequestDto** - Password reset request data

**Request/Response Models:**
- **CustomerAddressRequest** - Customer address management

### Security Features
- **Password Encryption** - BCrypt password hashing with BCrypt.Net-Next (work factor 12)
- **Role-Based Access Control** - User permission management for customer/vendor/admin roles
- **Session Management** - Secure user session handling with token-based authentication
- **Input Validation** - Data sanitization and validation on all endpoints
- **Error Handling** - Comprehensive exception management without exposing sensitive data
- **SQL Injection Prevention** - Parameterized stored procedures for all database operations

## Business Logic

### Product Management
- Products can be activated/deactivated without deletion
- Inactive products are automatically hidden from customer view
- Inactive products do not appear in search results or category filters
- Inactive products cannot be accessed via direct URL (customers only)
- Administrators can view and manage all products regardless of status
- Inventory tracking with stock levels
- Dynamic pricing with discount percentages
- Category-based organization and filtering
- Featured product promotion system
- Best seller analytics and recommendations

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
- **HTTP Client Testing** - Comprehensive endpoint testing
- **Error Scenario Testing** - Exception handling validation
- **Authentication Testing** - Security verification
- **Data Validation Testing** - Input validation checks

### Database Testing
- **Stored Procedure Testing** - Individual procedure validation
- **Data Integrity Testing** - Referential integrity checks
- **Performance Testing** - Query optimization validation

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
- **Shipping Integration** - Real-time shipping calculations
- **Email Notifications** - Order confirmations and updates
- **Advanced Analytics** - Business intelligence dashboards
- **Mobile Application** - Native mobile app development
- **Inventory Automation** - Automatic reorder points and supplier integration
- **Customer Reviews** - Product rating and review system
- **Wishlist Functionality** - Save products for future purchase

### Scalability Considerations
- **Caching Implementation** - Redis or in-memory caching
- **Load Balancing** - Multiple server deployment
- **Database Optimization** - Query performance tuning
- **CDN Integration** - Static asset delivery optimization

## Project Deliverables

### Documentation
- [API Endpoints Documentation](Documentation/APIEndpoints.md)
- [Database Design Documentation](Documentation/SQLDesign.md)
- [Setup Instructions](Documentation/SetupInstructions.md)
- [Testing Plan](Documentation/TestingPlan.md)
- [OOP Concepts Summary](Documentation/OOPConceptsSummary.md)
- [Project Overview](Documentation/ProjectOverview.md)
- [Architecture Decisions](Documentation/ArchitectureDecisions.md)
- [Token Security Implementation](Documentation/TokenSecurityImplementation.md)

### Code Deliverables
- Complete ASP.NET Core Web API application (.NET 9.0)
- React.js 19.x client application with React Router 7.x
- SQL Server database with stored procedures
- HTTP testing file for API validation (FinalProjectAPI.http)
- BCrypt.Net-Next integration for password security
- Comprehensive documentation suite

### Database Assets
- Database creation scripts
- Stored procedure implementations
- Sample data population scripts
- Database relationship diagrams

## Conclusion

The My Guitar Shop Management System represents a comprehensive solution for e-commerce and business management in the musical instrument retail industry. The project demonstrates advanced web development skills, database design expertise, and modern software architecture principles. The system provides a solid foundation for a real-world guitar retail business while showcasing professional development practices and coding standards.

The modular design, comprehensive feature set, and extensible architecture make this system suitable for both educational demonstration and potential commercial deployment with additional enhancements.
