# Architecture Decisions & System Design

## Project Information
- **Project Name:** My Guitar Shop Management System
- **Author:** Leena Komenski
- **Date:** November 2025
- **Purpose:** Document key architectural decisions and design patterns

---

## Controller Architecture Consolidation

### Decision: Unified AuthController for All Authentication

**Date Implemented:** November 19, 2025

**Problem:**
- Redundant authentication logic across multiple controllers (LoginController, CustomerController, AuthController)
- Inconsistent authentication patterns between user types
- Duplicate registration and login methods
- Maintenance complexity with scattered authentication code

**Solution:**
Single `AuthController` handles all authentication operations:
- Customer login and registration
- Vendor token-based registration and login
- Admin/Employee login
- Password reset flow
- All BCrypt password operations

**Benefits:**
- Single source of truth for authentication
- Consistent security implementation across all user types
- Easier to maintain and update security practices
- Reduced code duplication
- Clear separation: AuthController (authentication) vs other controllers (business logic)

**Controllers Removed:**
- `LoginController.cs` - Completely redundant with AuthController

**Controllers Updated:**
- `CustomerController.cs` - Removed `Login()` and `Register()` methods, kept profile/address management
- `AuthController.cs` - Consolidated all authentication logic

---

## Vendor Registration Security Model

### Decision: Token-Based Vendor Registration

**Date Implemented:** November 19, 2025

**Problem:**
- Vendors should not self-register like customers
- Need admin approval before vendor accounts are created
- Security risk of unauthorized vendor access

**Solution:**
Two-phase vendor registration:
1. **Admin Phase:** Employee adds vendor business info, generates secure token
2. **Vendor Phase:** Vendor receives token via email, uses it to create login credentials

**Security Features:**
- 48-hour token expiration (TTL)
- One-time use tokens (cleared after registration)
- Token invalidation on regeneration
- Secure modal-based token display (not persistent)
- BCrypt password hashing on account creation

**Benefits:**
- Admin approval required before vendor account creation
- Prevents unauthorized vendor registrations
- Time-limited access prevents stale tokens
- Secure token transmission via encrypted email
- Audit trail through DateUpdated fields

**Implementation Files:**
- `SQL Scripts/GenerateVendorRegistrationToken.sql`
- `SQL Scripts/VendorRegister.sql`
- `Controllers/VendorsController.cs`
- `components/TokenModal.js`

---

## Password Security Implementation

### Decision: BCrypt for All Password Operations

**Date Implemented:** Throughout development

**Why BCrypt:**
- Industry-standard password hashing algorithm
- Automatic salt generation per password
- Configurable work factor (set to 12 for security/performance balance)
- Timing-safe password verification
- Resistant to rainbow table attacks

**Implementation Details:**
- **Package:** BCrypt.Net-Next (latest maintained BCrypt implementation for .NET)
- **Work Factor:** 12 (2^12 = 4,096 iterations)
- **Hash Format:** `$2a$12$...` or `$2b$12$...` (60 characters)
- **Storage:** NVARCHAR(255) fields accommodate BCrypt hashes

**Password Operations:**
- Customer registration: `BCrypt.HashPassword(password)`
- Vendor registration: `BCrypt.HashPassword(password)`
- Login verification: `BCrypt.Verify(plaintextPassword, storedHash)`
- Password changes: Verify old password, hash new password

**Benefits:**
- No plain text passwords ever stored
- Each password has unique salt
- Timing-safe comparison prevents timing attacks
- Configurable difficulty scales with hardware improvements
- Industry-proven security

---

## Database Architecture

### Decision: Dual-Database Design

**Databases:**
1. **MyGuitarShop:** Customer-facing operations (products, orders, customers)
2. **AP (Accounts Payable):** Vendor and invoice management

**Benefits:**
- Clear separation of concerns
- Independent scaling (customer traffic vs vendor operations)
- Security isolation (vendor financial data separate)
- Different backup/recovery strategies per database
- Simplified access control per database

### Decision: Stored Procedure-Only Data Access

**Why Stored Procedures:**
- SQL injection prevention through parameterized queries
- Pre-compiled execution plans (performance)
- Centralized business logic in database
- Easier to optimize without code changes
- Clear contract between application and database

**Benefits:**
- Security: No dynamic SQL in application code
- Performance: Cached execution plans
- Maintainability: Database logic separate from application
- Testability: Can test procedures independently

---

## Frontend Architecture

### Decision: React with Context API

**Why React 19.x:**
- Modern component-based architecture
- Excellent ecosystem and community support
- Performance optimizations with Virtual DOM
- Hooks for cleaner state management

**Why Context API over Redux:**
- Simpler for application scope (cart, user state)
- No additional dependencies needed
- Sufficient for our state management needs
- Less boilerplate than Redux

**Routing:**
- React Router 7.x for declarative routing
- Protected routes based on user roles
- Clean URL structure

### Decision: Role-Based Navigation and Access Control

**Date Implemented:** November 2025

**Problem:**
- All users redirected to homepage after login regardless of role
- Vendors and employees could add products to cart (inappropriate for their roles)
- Inactive products visible to all users on homepage and search

**Solution:**
**Role-Based Login Redirects:**
- Vendors navigate to `/vendor-dashboard` after login
- Admins/Employees navigate to `/admin-dashboard` after login
- Customers navigate to `/` (homepage) after login

**Cart Access Restrictions:**
- CartContext checks user role before allowing addToCart
- Vendors and Admins/Employees blocked from adding items to cart
- Console warning displayed for restricted users
- Only customers and guests can use shopping cart functionality

**Product Visibility Controls:**
- Products with `isActive: false` filtered from homepage display
- Inactive products hidden from featured products and best sellers lists
- ProductDetails page shows error message for inactive products (customers only)
- Admins can view all products including inactive ones for management
- "Add to Cart" button only shown for customers and guests

**Implementation:**
- `LoginForm.js`: Role-based navigation after successful authentication
- `CartContext.js`: Role validation in addToCart function
- `HomePage.js`: Filter products by IsActive field before rendering
- `ProductDetails.js`: Conditional rendering based on product active status and user role

**Benefits:**
- Improved user experience with appropriate landing pages
- Clear separation of functionality by role
- Prevents inappropriate actions (vendors purchasing, customers accessing vendor tools)
- Inactive products hidden from customer view while allowing admin management
- Cleaner cart state (no items from non-customer users)

**Benefits:**
- Component reusability
- Fast development with hot reload
- Rich testing ecosystem (React Testing Library)
- Excellent user experience with responsive UI

### Decision: Breadcrumb Navigation

**Date Implemented:** November 19, 2025

**Problem:**
- Users navigating from dashboard to account settings had no way back except browser back button
- Poor UX when deep in application

**Solution:**
- Breadcrumb navigation showing path: Dashboard / Account Settings
- Clickable parent links for easy navigation
- Consistent placement at top of pages

**Benefits:**
- Improved user orientation
- Faster navigation
- Professional UX standard

---

## Repository Pattern Implementation

### Decision: Factory-Based Repository Pattern

**Why Repository Pattern:**
- Abstracts data access away from business logic
- Enables testability through interface mocking
- Supports multiple database providers

**Implementation:**
```
IDataRepository (interface)
  ↓
SqlServerRepository (implementation)
  ↓
DataRepositoryFactory (creates repositories)
  ↓
Controllers (consume via DI)
```

**Benefits:**
- Loose coupling between controllers and data access
- Easy to swap database providers
- Testable with mock repositories
- Single responsibility: repositories handle data, controllers handle HTTP

---

## API Design Standards

### Decision: RESTful API Design

**Standards:**
- Resource-based URLs: `/api/products/{id}`
- HTTP verbs: GET, POST, PUT, DELETE
- Standard status codes: 200, 400, 401, 404, 500
- JSON for request/response bodies
- Consistent error response format

**Benefits:**
- Industry-standard approach
- Self-documenting API structure
- Easy integration with frontend
- Familiar to developers

---

## Security Architecture

### Defense-in-Depth Strategy

**Layers:**
1. **Input Validation:** Client-side and server-side validation
2. **Authentication:** BCrypt password hashing, token expiration
3. **Authorization:** Role-based access control
4. **Data Access:** Parameterized stored procedures only
5. **Output Encoding:** JSON serialization prevents XSS
6. **HTTPS:** Encrypted transmission (production)

**Key Security Decisions:**
- No plain text passwords ever
- No direct SQL queries from application
- Generic error messages (no information leakage)
- Token expiration and one-time use
- Separate admin approval for vendor accounts

---

## Testing Strategy

### Decision: Manual Testing with HTTP Client Files

**Why .http Files:**
- Fast iteration during development
- Works natively with VS Code REST Client extension
- Version controlled with code
- Easy to share with team

**Future Enhancement:**
- Add automated integration tests with xUnit
- Add React component tests with React Testing Library
- Consider E2E tests with Playwright or Cypress

---

## Performance Considerations

### Current Optimizations:
- Database indexing on primary/foreign keys
- Stored procedure execution plans
- Connection pooling via .NET's default ADO.NET behavior
- Efficient React rendering with hooks

### Future Optimizations:
- Response caching for product catalog
- CDN for static assets (images)
- Database query optimization based on execution plans
- Redis caching layer for frequently accessed data

---

## Scalability Architecture

### Current Design Supports:
- Horizontal scaling of web API (stateless)
- Database read replicas for reporting
- Separate databases allow independent scaling

### Future Scaling Options:
- Load balancer for multiple API instances
- Caching layer (Redis)
- Message queue for async operations
- Microservices split by domain (if needed)

---

## Error Handling Strategy

### Consistent Error Responses:
Controllers return simple string messages with appropriate HTTP status codes:

```csharp
// Examples from actual controllers:
return BadRequest("Invalid ProductID.");
return Unauthorized("Invalid customer credentials.");
return NotFound("Product with ID 123 not found.");
return StatusCode(500, "Internal server error: Failed to retrieve products.");
```

### Error Levels:
- **400:** Client input errors (validation failures) - Returns descriptive string message
- **401:** Authentication failures - Returns security-appropriate string message  
- **404:** Resource not found - Returns specific string message about missing resource
- **500:** Server errors (database, exceptions) - Returns generic string message with "Internal server error" prefix

### Security Considerations:
- Simple string messages instead of complex error objects
- Generic error messages for 500 errors to avoid exposing internal details
- Specific validation messages for 400 errors to help users
- Authentication errors don't reveal whether email exists
- Exception details are hidden from client responses

---

## Deployment Architecture

### Development Environment:
- SQL Server Express on localhost
- .NET API on http://localhost:5077
- React dev server on http://localhost:3000

### Production Considerations:
- SQL Server Standard/Enterprise edition
- IIS or Azure App Service hosting
- HTTPS with valid SSL certificates
- Environment-specific configuration files
- Connection string encryption
- CORS restricted to production domain

---

## Documentation Standards

### Documentation Files:
- **ProjectOverview.md:** High-level project description
- **APIEndpoints.md:** Complete API reference
- **SQLDesign.md:** Database schema and procedures
- **SetupInstructions.md:** Development environment setup
- **TestingPlan.md:** Comprehensive testing procedures
- **OOPConceptsSummary.md:** OOP implementation details
- **TokenSecurityImplementation.md:** Vendor registration security
- **ArchitectureDecisions.md:** This file

### Why Documentation Matters:
- Onboarding new developers
- Reference during development
- Project portfolio demonstration
- Academic submission requirements

---

## Technology Stack Justification

### Backend: .NET 9.0
- **Why:** Latest LTS version, excellent performance, cross-platform
- **Alternatives Considered:** Node.js (chose .NET for type safety, performance, OOP)

### Frontend: React 19.x
- **Why:** Industry standard, excellent ecosystem, component architecture
- **Alternatives Considered:** Vue.js, Angular (chose React for community size, job market)

### Database: SQL Server
- **Why:** Excellent stored procedure support, robust transaction handling
- **Alternatives Considered:** PostgreSQL, MySQL (chose SQL Server for enterprise features, course focus)

### Password Security: BCrypt.Net-Next
- **Why:** Industry standard, actively maintained, proven security
- **Alternatives Considered:** Argon2 (chose BCrypt for wider adoption, simpler implementation)

---

## Lessons Learned

### What Worked Well:
- Repository pattern made testing and maintenance easier
- Stored procedures provided excellent security and performance
- React Context API sufficient for state management needs
- BCrypt integration straightforward and secure
- Role-based access control implemented successfully
- Product visibility controls with IsActive field
- Login redirects based on user roles

### What Could Be Improved:
- Earlier consolidation of authentication controllers
- More comprehensive automated testing from start
- Earlier implementation of token-based vendor registration
- More detailed API documentation from beginning

### Future Enhancements:
- JWT tokens for stateless authentication
- Email integration for password resets and token delivery
- Two-factor authentication
- Advanced analytics dashboards with charts
- Mobile app using same API

---

## Conclusion

The My Guitar Shop Management System demonstrates thoughtful architectural decisions that balance security, maintainability, scalability, and developer experience. The consolidation of authentication logic, implementation of token-based vendor registration, and use of industry-standard security practices (BCrypt) create a robust foundation for a production-ready application.

Key architectural strengths:
- **Security-First Design:** BCrypt, token expiration, role-based access
- **Maintainable Code:** Repository pattern, single responsibility controllers
- **Scalable Architecture:** Dual-database design, stateless API
- **Professional Standards:** RESTful API, comprehensive documentation, testing strategy

These decisions create a system that is both academically rigorous and commercially viable, suitable for portfolio demonstration and real-world deployment.
