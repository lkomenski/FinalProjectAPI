# My Guitar Shop - Object-Oriented Programming (OOP) Concepts Summary

## Overview

The My Guitar Shop Management System extensively demonstrates all four core Object-Oriented Programming principles throughout its architecture. This document analyzes how **Encapsulation**, **Inheritance**, **Polymorphism**, and **Abstraction** are implemented in both the backend ASP.NET Core API and frontend React application.

---

## 1. Encapsulation

Encapsulation is the bundling of data and methods that operate on that data within a single unit, while hiding the internal implementation details.

### Backend Implementation

#### Data Models with Property Encapsulation
All model classes use C# properties with proper access control:

```csharp
// Product.cs - Example of Property Encapsulation
public class Product
{
    public int ProductID { get; set; }
    public int CategoryID { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal ListPrice { get; set; }
    public decimal DiscountPercent { get; set; }
    public string? ImageURL { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime DateAdded { get; set; }
    public DateTime? DateUpdated { get; set; }
}

// ChangePasswordRequest.cs - Encapsulation of Password Security Logic
public class ChangePasswordRequest
{
    public int CustomerID { get; set; }
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
    
    // Encapsulates password validation rules
    public bool IsValid()
    {
        return !string.IsNullOrEmpty(OldPassword) 
            && !string.IsNullOrEmpty(NewPassword) 
            && NewPassword.Length >= 8;
    }
}
```

**Benefits Demonstrated:**
- **Data Validation:** Properties can include validation logic
- **Access Control:** Public getters/setters provide controlled access
- **Default Values:** Properties initialize with sensible defaults
- **Nullable Types:** Optional properties use nullable reference types
- **Security:** Password data encapsulated with validation methods

#### Repository Pattern Encapsulation
The repository classes encapsulate database access logic:

```csharp
// SqlServerRepository.cs - Data Access Encapsulation
public class SqlServerRepository : IDataRepository
{
    private readonly string _connectionString = string.Empty; // Private field

    public SqlServerRepository(string connectionString)
    {
        _connectionString = connectionString ?? string.Empty;
    }

    public async Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc)
    {
        // Complex database logic hidden from external classes
        // Connection management, error handling, data mapping all encapsulated
    }
}
```

**Encapsulation Benefits:**
- **Hidden Complexity:** Database connection details are private
- **Consistent Interface:** Public methods provide standard data access
- **Error Handling:** Internal exception management
- **Resource Management:** Automatic connection disposal

#### Controller Encapsulation
Controllers encapsulate HTTP request/response logic and security operations:

```csharp
// AuthController.cs - Business Logic and Security Encapsulation
public class AuthController : ControllerBase
{
    private readonly IDataRepository _myGuitarShopRepo; // Private dependency
    private readonly IDataRepository _apRepo; // Private dependency

    public AuthController(IDataRepositoryFactory factory)
    {
        _myGuitarShopRepo = factory.Create("MyGuitarShop"); // Encapsulated initialization
        _apRepo = factory.Create("AP");
    }

    [HttpPost("customer/login")]
    public async Task<IActionResult> CustomerLogin([FromBody] LoginRequest request)
    {
        try
        {
            // Get customer by email
            var rows = await _myGuitarShopRepo.GetDataAsync("GetCustomerByEmail", parameters);
            
            // Verify password using BCrypt - security logic encapsulated
            string storedHashedPassword = row["Password"]?.ToString() ?? "";
            if (!BCrypt.Net.BCrypt.Verify(request.Password, storedHashedPassword))
            {
                return Unauthorized("Invalid credentials.");
            }
            
            return Ok(response); // Encapsulated response creation
        }
        catch (Exception)
        {
            return StatusCode(500, "Internal server error");
        }
    }

    // Private helper method - implementation detail hidden
    private bool ValidatePasswordStrength(string password)
    {
        // Complex password validation logic encapsulated
        return password.Length >= 8;
    }
}

// CustomerController.cs - Password Management Encapsulation
public class CustomerController : ControllerBase
{
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            // Retrieve current password hash
            var customerRows = await _repo.GetDataAsync("GetCustomerById", parameters);
            string storedPassword = customerRow["Password"]?.ToString() ?? "";
            
            // Verify old password with BCrypt - encapsulated security check
            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, storedPassword))
            {
                return BadRequest("Old password is incorrect.");
            }
            
            // Hash new password with BCrypt - encapsulated security operation
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            
            // Update password in database
            await _repo.GetDataAsync("UpdateCustomerPassword", updateParams);
            
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception)
        {
            return StatusCode(500, "Failed to change password");
        }
    }
}
```

**Encapsulation Benefits:**
- **Security Isolation:** BCrypt operations hidden from public interface
- **Password Protection:** Hashing logic never exposed to clients
- **Validation Encapsulation:** Password strength rules contained in controller
- **Error Handling:** Internal exception management without exposing sensitive details

### Frontend Implementation

#### Component State Encapsulation
React components encapsulate their state and behavior:

```javascript
// LoginForm.js - Component State Encapsulation
export default function LoginForm() {
  // Private state variables
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  // Private validation method
  const validateForm = () => {
    if (!emailAddress || !password) {
      setError("Email and password are required.");
      return false;
    }
    // Additional validation logic encapsulated
  };

  // Public interface through props and events
  return (
    <form onSubmit={handleLogin}>
      {/* UI elements */}
    </form>
  );
}

// ChangePasswordModal.js - Password Security Encapsulation
export default function ChangePasswordModal({ customerId, onClose }) {
  // Private password state - never exposed
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Private validation - encapsulated security rules
  const validatePasswordChange = () => {
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };
  
  // Encapsulated API call - implementation hidden
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;
    
    // BCrypt hashing happens on server - client never sees hash
    const response = await fetch(`${API_BASE}/customer/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, oldPassword, newPassword })
    });
    
    if (response.ok) {
      onClose(true); // Success callback
    }
  };
}
```

---

## 2. Inheritance

Inheritance allows classes to inherit properties and methods from parent classes, promoting code reuse and establishing hierarchical relationships.

### Backend Implementation

#### Controller Base Class Inheritance
All API controllers inherit from `ControllerBase`:

```csharp
// Example: AuthController inherits from ControllerBase
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Inherits HTTP context, request/response handling, and action result methods
    // - Ok(), BadRequest(), StatusCode() methods from base class
    // - ModelState validation capabilities
    // - Routing and action method detection
}

// All other controllers follow the same pattern:
public class ProductsController : ControllerBase { }
public class VendorsController : ControllerBase { }
public class CustomersController : ControllerBase { }
```

**Inherited Capabilities:**
- **HTTP Response Methods:** `Ok()`, `BadRequest()`, `NotFound()`, `StatusCode()`
- **Request Processing:** Model binding, validation, routing
- **Context Access:** User information, request headers, session data
- **Action Filters:** Authentication, authorization, caching

#### Interface Implementation (Contract Inheritance)
Repository classes implement common interfaces:

```csharp
// Interface defines the contract
public interface IDataRepository
{
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc);
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc, IDictionary<string, object?> parameters);
}

// Multiple implementations inherit the contract
public class SqlServerRepository : IDataRepository
{
    // SQL Server specific implementation
}

public class MySqlRepository : IDataRepository
{
    // MySQL specific implementation
}
```

**Benefits:**
- **Consistent Interface:** All repositories provide the same methods
- **Interchangeability:** Can swap database providers without changing controller code
- **Contract Enforcement:** Interface ensures required methods are implemented

#### Model Inheritance Patterns
Dashboard models demonstrate inheritance relationships:

```csharp
// VendorDashboard.cs - Related model classes
public class VendorDashboardModel
{
    public int VendorID { get; set; }
    public string? VendorName { get; set; }
    // Core vendor dashboard properties
}

public class VendorInvoiceSummary
{
    public int InvoiceID { get; set; }
    public string? InvoiceNumber { get; set; }
    // Invoice-specific properties that extend vendor data
}

public class InvoiceLineItem
{
    public int InvoiceSequence { get; set; }
    public decimal InvoiceLineItemAmount { get; set; }
    // Detailed line item properties
}

// Authentication Model Hierarchy
public class LoginRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Role { get; set; }
}

public class CustomerRegistrationRequest : LoginRequest
{
    // Inherits EmailAddress and Password
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class VendorRegisterRequest : LoginRequest
{
    // Inherits EmailAddress and Password
    public string VendorName { get; set; } = string.Empty;
    public string VendorAddress1 { get; set; } = string.Empty;
    public string VendorCity { get; set; } = string.Empty;
    public string VendorState { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    // Additional vendor-specific properties
}
```

### Frontend Implementation

#### React Component Inheritance
React functional components inherit from React's component system:

```javascript
// All components inherit React capabilities
export default function ProductCard({ product }) {
  // Inherits: useState, useEffect, JSX rendering, lifecycle methods
  const [isLoading, setIsLoading] = useState(false);
  
  // Component-specific logic built on React foundation
  return (
    <div className="product-card">
      {/* Component JSX */}
    </div>
  );
}

// VendorRegisterForm.js - Extends base form patterns
export default function VendorRegisterForm() {
  // Inherits React hooks and component lifecycle
  const [formData, setFormData] = useState({
    vendorName: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
    // Vendor-specific fields
  });
  
  // Inherits event handling patterns from React
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Custom vendor registration logic
  };
}
```

#### Class-based Inheritance (where applicable)
```javascript
// Error boundaries and specialized components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props); // Inherits from React.Component
    this.state = { hasError: false };
  }

  // Inherits lifecycle methods: componentDidMount, componentDidUpdate, etc.
}
```

---

## 3. Polymorphism

Polymorphism allows objects of different classes to be treated as instances of the same type through a common interface, enabling method calls to behave differently based on the object type.

### Backend Implementation

#### Interface Polymorphism
The repository factory demonstrates polymorphism through interface implementation:

```csharp
public class DataRepositoryFactory : IDataRepositoryFactory
{
    public IDataRepository Create(string databaseName)
    {
        var dbProvider = _configuration["DbProvider"] ?? "SqlServer";

        // Same interface, different implementations (polymorphic behavior)
        switch (dbProvider.Trim().ToLower())
        {
            case "mysql":
                return new MySqlRepository(connectionString);
            case "sqlserver":
                return new SqlServerRepository(connectionString);
            default:
                throw new NotSupportedException($"Database provider '{dbProvider}' is not supported.");
        }
    }
}

// Controllers use the interface polymorphically
public class ProductsController : ControllerBase
{
    private readonly IDataRepository _repo; // Interface reference

    public ProductsController(IDataRepositoryFactory factory)
    {
        _repo = factory.Create("MyGuitarShop"); // Could be SQL Server or MySQL
    }

    public async Task<IActionResult> GetAllProducts()
    {
        // Same method call works with any IDataRepository implementation
        var rows = await _repo.GetDataAsync("GetAllProducts");
    }
}
```

**Polymorphic Benefits:**
- **Database Flexibility:** Switch between SQL Server and MySQL without changing business logic
- **Testing:** Can inject mock repositories for unit testing
- **Extensibility:** New database providers can be added without modifying existing code

#### Method Overloading (Compile-time Polymorphism)
Repository methods demonstrate method overloading:

```csharp
public interface IDataRepository
{
    // Same method name, different parameters (method overloading)
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc);
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc, IDictionary<string, object?> parameters);
}

// Usage demonstrates polymorphic method selection
await _repo.GetDataAsync("GetAllProducts"); // Calls parameterless version
await _repo.GetDataAsync("GetProductById", parameters); // Calls parameterized version
```

#### Action Result Polymorphism
Controller actions return different types through common `IActionResult` interface:

```csharp
public async Task<IActionResult> GetProductById(int productId)
{
    if (productId <= 0)
    {
        return BadRequest("Invalid ProductID."); // BadRequestResult
    }

    var result = await _repo.GetDataAsync("GetProductById", parameters);
    
    if (result == null)
    {
        return NotFound(); // NotFoundResult
    }
    
    return Ok(result.FirstOrDefault()); // OkObjectResult
}
// All return types implement IActionResult (polymorphic return types)
```

### Frontend Implementation

#### Component Polymorphism
React components can be rendered polymorphically:

```javascript
// Different component types rendered based on user role
function Dashboard({ userRole }) {
  const renderDashboard = () => {
    switch(userRole) {
      case 'customer':
        return <CustomerDashboard />; // Different component
      case 'vendor':
        return <VendorDashboard />; // Different component  
      case 'admin':
        return <AdminDashboard />; // Different component
      default:
        return <LoginForm />;
    }
  };

  return (
    <div className="dashboard-container">
      {renderDashboard()} {/* Polymorphic component rendering */}
    </div>
  );
}
```

#### Event Handler Polymorphism
Different form handlers based on operation type:

```javascript
// VendorForm.js - Polymorphic form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  // Same handler, different API endpoints based on edit mode
  const endpoint = isEditing 
    ? "vendors/update"      // PUT operation
    : "vendors/add";        // POST operation

  const method = isEditing ? "PUT" : "POST";

  // Polymorphic API call
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form)
  });
};
```

---

## 4. Abstraction

Abstraction hides complex implementation details while exposing only essential features through simplified interfaces.

### Backend Implementation

#### Interface Abstraction
The `IDataRepository` interface abstracts database operations:

```csharp
// Abstract interface hides database complexity
public interface IDataRepository
{
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc);
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc, IDictionary<string, object?> parameters);
}

// Controllers work with the abstraction, not concrete implementation
public class ProductsController : ControllerBase
{
    private readonly IDataRepository _repo; // Abstract interface

    // Controller doesn't know about SQL connections, command objects, or data readers
    public async Task<IActionResult> GetAllProducts()
    {
        // Simple, abstract method call
        var rows = await _repo.GetDataAsync("GetAllProducts");
        return Ok(rows.Select(MapRowToProduct).ToList());
    }
}
```

**Abstraction Benefits:**
- **Simplified Usage:** Controllers don't handle database complexity
- **Implementation Independence:** Can change database providers transparently  
- **Testing Simplification:** Easy to mock abstract interfaces

#### Factory Pattern Abstraction
The factory pattern abstracts object creation:

```csharp
public interface IDataRepositoryFactory
{
    IDataRepository Create(string databaseName); // Abstract creation method
}

public class DataRepositoryFactory : IDataRepositoryFactory
{
    public IDataRepository Create(string databaseName)
    {
        // Complex creation logic abstracted away from consumers
        var connectionString = _configuration.GetConnectionString(databaseName);
        var dbProvider = _configuration["DbProvider"] ?? "SqlServer";

        return dbProvider.ToLower() switch
        {
            "mysql" => new MySqlRepository(connectionString),
            "sqlserver" => new SqlServerRepository(connectionString),
            _ => throw new NotSupportedException($"Provider '{dbProvider}' not supported.")
        };
    }
}

// Usage is simple and abstract
public class ProductsController : ControllerBase
{
    public ProductsController(IDataRepositoryFactory factory)
    {
        _repo = factory.Create("MyGuitarShop"); // Abstract creation
    }
}
```

#### API Endpoint Abstraction
RESTful controllers provide abstract interfaces for HTTP operations:

```csharp
[HttpGet]
public async Task<IActionResult> GetAllProducts()
{
    // Abstracts: database queries, data mapping, HTTP response formatting
}

[HttpPost]  
public async Task<IActionResult> AddProduct([FromBody] Product product)
{
    // Abstracts: validation, database insertion, response creation
}

[HttpPut("{productId}")]
public async Task<IActionResult> UpdateProduct(int productId, [FromBody] Product product)
{
    // Abstracts: parameter binding, database updates, error handling
}
```

### Frontend Implementation

#### API Service Abstraction
Frontend API calls are abstracted through service functions:

```javascript
// Api.js - Abstracts HTTP communication details
const API_BASE = "http://localhost:5077/api";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

// Components use the abstraction
useEffect(() => {
  fetchData("products") // Abstract API call
    .then(setProducts)
    .catch(setError);
}, []);
```

#### State Management Abstraction
React Context provides abstraction for global state:

```javascript
// CartContext.js - State management abstraction with role-based access control
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Abstract cart operations with role restrictions
  const addToCart = (product) => {
    // Prevent vendors and employees from adding to cart (Encapsulation)
    if (currentUser && (currentUser.role === 'vendor' || currentUser.role === 'admin')) {
      console.warn('Vendors and employees cannot add items to cart');
      return; // Access control through encapsulation
    }
    // Complex cart logic abstracted
  };

  const removeFromCart = (productId) => {
    // Removal logic abstracted  
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, currentUser }}>
      {children}
    </CartContext.Provider>
  );
};

// Components use abstract interface with conditional rendering
function ProductCard({ product }) {
  const { addToCart, currentUser } = useContext(CartContext); // Abstract cart operations
  
  return (
    <div>
      {/* Role-based UI rendering (Polymorphism) */}
      {(!currentUser || currentUser.role === 'customer') && (
        <button onClick={() => addToCart(product)}>
          Add to Cart {/* Implementation details hidden */}
        </button>
      )}
    </div>
  );
}
```

#### Component Interface Abstraction
React components provide abstract interfaces through props:

```javascript
// ProductCard.js - Component abstraction
function ProductCard({ product, onAddToCart, showAdminControls }) {
  // Internal implementation abstracted from parent components
  
  return (
    <div className="product-card">
      <img src={product.imageURL} alt={product.productName} />
      <h3>{product.productName}</h3>
      <p>${product.listPrice?.toFixed(2)}</p>
      
      {showAdminControls && (
        <AdminControls product={product} /> // Abstract admin functionality
      )}
      
      <button onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}

// Parent components use the abstraction
function ProductList() {
  return (
    <div>
      {products.map(product => (
        <ProductCard 
          key={product.productID}
          product={product}
          onAddToCart={handleAddToCart} // Abstract callback
          showAdminControls={isAdmin}
        />
      ))}
    </div>
  );
}
```

---

### Advanced OOP Concepts Implementation

### Security Through Encapsulation: BCrypt Integration

The project demonstrates how OOP encapsulation enhances security through the BCrypt.Net-Next implementation:

```csharp
// AuthController.cs - Security Encapsulation Example
public class AuthController : ControllerBase
{
    // BCrypt operations encapsulated within controller methods
    [HttpPost("customer/login")]
    public async Task<IActionResult> CustomerLogin([FromBody] LoginRequest request)
    {
        // Password verification encapsulated - client never sees hash or algorithm
        string storedHashedPassword = row["Password"]?.ToString() ?? "";
        
        // BCrypt.Verify encapsulates complex cryptographic verification
        if (!BCrypt.Net.BCrypt.Verify(request.Password, storedHashedPassword))
        {
            // Generic error message - implementation details hidden
            return Unauthorized("Invalid credentials.");
        }
        
        // Success response - no password data exposed
        return Ok(new LoginResponse { /* user data, no password */ });
    }
    
    [HttpPost("customer/register")]
    public async Task<IActionResult> RegisterCustomer([FromBody] CustomerRegistrationRequest request)
    {
        // Password confirmation validation encapsulated
        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest("Password and confirmation password do not match.");
        }
        
        // BCrypt.HashPassword encapsulates hashing algorithm (work factor 12)
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);
        
        // Only hash stored in database - original password never persisted
        var parameters = new Dictionary<string, object?>
        {
            { "@Password", hashedPassword } // Encapsulated security
        };
    }
}
```

**Security Benefits of Encapsulation:**
- **Algorithm Abstraction:** BCrypt implementation hidden from clients
- **Work Factor Management:** Complexity parameter (12) encapsulated in library
- **Salt Generation:** Automatic salt creation hidden from developers
- **Verification Logic:** Timing-safe comparison encapsulated
- **Error Handling:** Generic error messages prevent information leakage

### Dependency Injection

The project extensively uses Dependency Injection, an advanced OOP pattern:

```csharp
// Program.cs - Service Registration
var builder = WebApplication.CreateBuilder(args);

// Register services with DI container
builder.Services.AddSingleton<IDataRepositoryFactory, DataRepositoryFactory>();

// Controllers automatically receive dependencies
public class ProductsController : ControllerBase
{
    private readonly IDataRepository _repo;

    // Dependencies injected through constructor
    public ProductsController(IDataRepositoryFactory factory)
    {
        _repo = factory.Create("MyGuitarShop");
    }
}
```

**Benefits:**
- **Loose Coupling:** Controllers depend on interfaces, not concrete classes
- **Testability:** Easy to inject mock dependencies for testing
- **Configuration:** Dependencies configured centrally
- **Lifetime Management:** DI container manages object lifecycles

### SOLID Principles Implementation

#### Single Responsibility Principle (SRP)
Each class has one reason to change:

```csharp
// ProductsController - Responsible only for HTTP request handling
public class ProductsController : ControllerBase { }

// SqlServerRepository - Responsible only for SQL Server data access  
public class SqlServerRepository : IDataRepository { }

// Product - Responsible only for representing product data
public class Product { }
```

#### Open/Closed Principle (OCP)
Classes are open for extension, closed for modification:

```csharp
// Can add new repository implementations without changing existing code
public class PostgreSqlRepository : IDataRepository
{
    // New implementation extends system without modifying existing classes
}
```

#### Interface Segregation Principle (ISP)
Interfaces are focused and specific:

```csharp
// Focused interface - only data access operations
public interface IDataRepository
{
    Task<IEnumerable<IDictionary<string, object?>>> GetDataAsync(string storedProc);
}

// Separate interface for factory operations
public interface IDataRepositoryFactory  
{
    IDataRepository Create(string databaseName);
}
```

#### Dependency Inversion Principle (DIP)
High-level modules depend on abstractions:

```csharp
// Controller (high-level) depends on IDataRepository (abstraction)
public class ProductsController : ControllerBase
{
    private readonly IDataRepository _repo; // Abstraction, not concrete class
}
```

### Design Patterns Implementation

#### Repository Pattern
Abstracts data access logic:
- `IDataRepository` interface defines contract
- `SqlServerRepository` and `MySqlRepository` provide implementations
- Controllers use repositories through interface

#### Factory Pattern
Encapsulates object creation logic:
- `IDataRepositoryFactory` abstracts repository creation
- `DataRepositoryFactory` handles complex creation logic
- Supports multiple database providers through configuration

#### Model-View-Controller (MVC) Pattern
Separates concerns across application layers:
- **Models:** Data representation (`Product`, `Customer`, `Vendor`)
- **Views:** Frontend React components
- **Controllers:** HTTP request handlers (`ProductsController`, `AuthController`)

---

## Benefits of OOP Implementation

### Code Maintainability
- **Modular Design:** Changes isolated to specific classes
- **Clear Interfaces:** Easy to understand component interactions  
- **Separation of Concerns:** Each class has focused responsibility

### Code Reusability
- **Interface Implementation:** Same interface, multiple implementations
- **Base Class Inheritance:** Shared functionality through controller base classes
- **Component Composition:** React components reused across application

### Testing and Quality
- **Mock Objects:** Interface-based design enables easy mocking
- **Unit Testing:** Isolated classes enable focused testing
- **Integration Testing:** Abstract interfaces simplify test setup

### Scalability and Extensibility  
- **New Features:** Add new controllers without changing existing code
- **Database Support:** Add new database providers through interface implementation
- **Frontend Components:** Create new components following established patterns

### Team Development
- **Clear Contracts:** Interfaces define clear boundaries between team responsibilities
- **Parallel Development:** Frontend and backend teams can work independently
- **Code Standards:** Consistent OOP patterns across entire project

---

## Learning Outcomes Demonstrated

### Core OOP Mastery
- **Encapsulation:** Private fields, public properties, hidden implementation details
- **Inheritance:** Base class extension, interface implementation, code reuse
- **Polymorphism:** Interface-based polymorphism, method overloading, runtime type selection
- **Abstraction:** Interface design, complex logic hiding, simplified public APIs

### Advanced Patterns
- **Dependency Injection:** Loose coupling, testable design, configuration-based dependencies
- **Repository Pattern:** Data access abstraction, testable business logic
- **Factory Pattern:** Object creation abstraction, configuration-driven instantiation
- **MVC Architecture:** Clear separation of presentation, business, and data layers

### Professional Development Practices
- **SOLID Principles:** Industry-standard design principles application
- **Clean Code:** Readable, maintainable, well-documented code
- **Error Handling:** Robust exception management and user feedback
- **Documentation:** Comprehensive XML documentation and code comments
- **Security Best Practices:** BCrypt password hashing with proper encapsulation
- **Input Validation:** Client and server-side validation for data integrity
- **Separation of Concerns:** Clear boundaries between security, business logic, and data access

### Modern Framework Integration
- **.NET 9.0:** Latest framework features and performance improvements
- **React 19.x:** Modern frontend with hooks and functional components
- **React Router 7.x:** Advanced routing with protected routes
- **BCrypt.Net-Next:** Industry-standard password security
- **React Testing Library:** Modern testing approach for React components

---

## Conclusion

The My Guitar Shop Management System serves as a comprehensive demonstration of Object-Oriented Programming principles in a real-world application context. The project successfully implements all four core OOP concepts (Encapsulation, Inheritance, Polymorphism, and Abstraction) while incorporating advanced design patterns and professional development practices.

The architecture demonstrates how proper OOP implementation results in maintainable, testable, and extensible code that can scale with business requirements while enabling effective team collaboration. The consistent application of these principles throughout both backend and frontend code creates a cohesive system that exemplifies modern software development best practices.

**Key OOP Achievements:**
- **Encapsulation Excellence:** BCrypt security operations properly encapsulated, protecting password data and cryptographic algorithms from exposure
- **Inheritance Hierarchy:** Registration models demonstrate proper inheritance with CustomerRegistrationRequest and VendorRegisterRequest extending base LoginRequest
- **Polymorphic Design:** Database provider abstraction enables switching between SQL Server and MySQL without code changes
- **Abstraction Mastery:** Complex security operations (BCrypt hashing, verification) hidden behind simple, clean interfaces
- **Security Through OOP:** Demonstrates how OOP principles (especially encapsulation) enhance application security by hiding implementation details and preventing sensitive data exposure

The project showcases how Object-Oriented Programming principles, when properly applied, create secure, maintainable, and professional-grade software systems. The integration of BCrypt password security through encapsulated methods demonstrates real-world application of OOP for critical security requirements.
