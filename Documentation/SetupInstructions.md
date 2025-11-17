# My Guitar Shop - Setup Instructions

## Prerequisites

Before setting up the My Guitar Shop Management System, ensure you have the following software installed:

### Required Software
- **Visual Studio 2022** or **Visual Studio Code** with C# extension
- **.NET 9.0 SDK** or later
- **SQL Server 2019** or later (or SQL Server Express)
- **SQL Server Management Studio (SSMS)** (recommended for database management)
- **Node.js 18.x** or later
- **npm** (comes with Node.js)
- **Git** (for version control)

### Optional Tools
- **Postman** or **Thunder Client** (for API testing)
- **React Developer Tools** (browser extension)
- **SQL Server Data Tools** (SSDT)

## Database Setup

### 1. SQL Server Configuration

1. **Install SQL Server:**
   - Download and install SQL Server 2019 or later
   - During installation, note the server name (usually `localhost` or `.\SQLEXPRESS`)
   - Enable Mixed Mode Authentication if using SQL Server Authentication

2. **Verify SQL Server is Running:**
   ```bash
   # Check if SQL Server service is running
   services.msc
   # Look for "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"
   ```

### 2. Database Creation

1. **Open SQL Server Management Studio (SSMS)**
   - Connect to your SQL Server instance
   - Server name: `localhost` or `.\SQLEXPRESS`
   - Authentication: Windows Authentication (recommended)

2. **Create Databases:**
   ```sql
   -- Create the main customer-facing database
   CREATE DATABASE MyGuitarShop;
   
   -- Create the accounts payable database
   CREATE DATABASE AP;
   ```

3. **Execute SQL Scripts:**
   
   Navigate to the `SQL Scripts` folder in the project and execute the scripts in the following order:
   
   **For MyGuitarShop Database:**
   - Execute all scripts that reference `USE [MyGuitarShop]`
   - Key scripts include:
     - `AlterCustomerTable.sql`
     - `AlterProductsTable.sql`
     - `GetCategories.sql`
     - `GetAllProducts.sql`
     - `AddProduct.sql`
     - `UpdateProduct.sql`
     - `DeleteCustomer.sql`
     - `CustomerLogin.sql`
     - `CustomerRegister.sql`
     - `GetCustomerDashboard.sql`
     - `GetEmployeeDashboard.sql`
     - `GetFeaturedProducts.sql`
     - `GetBestSellers.sql`
     - And all other MyGuitarShop-related scripts

   **For AP Database:**
   - Execute all scripts that reference `USE [AP]`
   - Key scripts include:
     - `AlterVendorTable.sql`
     - `AddVendor.sql`
     - `UpdateVendor.sql`
     - `DeleteVendorById.sql`
     - `GetAllVendors.sql`
     - `GetVendorById.sql`
     - `GetVendorDashboard.sql`
     - `GetInvoiceById.sql`
     - `GetInvoiceDetail.sql`
     - `VendorLogin.sql`
     - And all other AP-related scripts

### 3. Configure Connection Strings

1. **Create `appsettings.Local.json`** in the project root directory:
   ```json
   {
     "ConnectionStrings": {
       "MyGuitarShop": "Server=localhost;Database=MyGuitarShop;Trusted_Connection=true;TrustServerCertificate=true;",
       "AP": "Server=localhost;Database=AP;Trusted_Connection=true;TrustServerCertificate=true;"
     },
     "DbProvider": "SqlServer"
   }
   ```

2. **Alternative Connection String (SQL Server Authentication):**
   ```json
   {
     "ConnectionStrings": {
       "MyGuitarShop": "Server=localhost;Database=MyGuitarShop;User Id=your_username;Password=your_password;TrustServerCertificate=true;",
       "AP": "Server=localhost;Database=AP;User Id=your_username;Password=your_password;TrustServerCertificate=true;"
     },
     "DbProvider": "SqlServer"
   }
   ```

3. **For SQL Server Express:**
   ```json
   {
     "ConnectionStrings": {
       "MyGuitarShop": "Server=.\\SQLEXPRESS;Database=MyGuitarShop;Trusted_Connection=true;TrustServerCertificate=true;",
       "AP": "Server=.\\SQLEXPRESS;Database=AP;Trusted_Connection=true;TrustServerCertificate=true;"
     },
     "DbProvider": "SqlServer"
   }
   ```

## Backend API Setup

### 1. Clone and Navigate to Project
```bash
# Clone the repository (if from Git)
git clone [repository-url]
cd FinalProjectAPI

# Or navigate to existing project folder
cd /path/to/FinalProjectAPI
```

### 2. Restore NuGet Packages
```bash
# Restore .NET packages
dotnet restore
```

### 3. Build the Project
```bash
# Build the solution
dotnet build

# Or build in release mode
dotnet build --configuration Release
```

### 4. Verify Database Connectivity
1. **Test Connection:**
   - Run the application temporarily to test database connections
   ```bash
   dotnet run
   ```
   - Check console output for any connection errors
   - Stop the application (Ctrl+C)

### 5. Configure Launch Settings
1. **Verify `Properties/launchSettings.json`:**
   ```json
   {
     "profiles": {
       "http": {
         "commandName": "Project",
         "dotnetRunMessages": true,
         "launchBrowser": false,
         "applicationUrl": "http://localhost:5077",
         "environmentVariables": {
           "ASPNETCORE_ENVIRONMENT": "Development"
         }
       }
     }
   }
   ```

## Frontend React App Setup

### 1. Navigate to Client App Directory
```bash
cd client-app
```

### 2. Install Node.js Dependencies
```bash
# Install all required packages
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps
```

### 3. Verify Package Installation
```bash
# Check installed packages
npm list

# Key packages should include:
# - react@^19.2.0
# - react-dom@^19.2.0
# - react-router-dom@^7.9.5
# - react-scripts@5.0.1
```

### 4. Configure API Base URL
1. **Create `.env` file in `client-app` directory:**
   ```env
   REACT_APP_API_URL=http://localhost:5077
   PORT=3000
   ```

2. **Update API calls (if needed):**
   - Check `src/components/Api.js` or similar files
   - Ensure API URLs point to `http://localhost:5077`

## Running the Application

### 1. Start the Backend API

**Option A: Using Visual Studio**
1. Open `FinalProjectAPI.sln` in Visual Studio
2. Set `FinalProjectAPI` as the startup project
3. Press F5 or click "Start Debugging"
4. API will be available at `http://localhost:5077`

**Option B: Using Command Line**
```bash
# From project root directory
dotnet run

# Or run with specific configuration
dotnet run --configuration Development
```

**Option C: Using Visual Studio Code**
1. Open the project folder in VS Code
2. Install C# extension if not already installed
3. Open terminal in VS Code
4. Run: `dotnet run`

### 2. Start the React Frontend

```bash
# From client-app directory
npm start

# The app will open at http://localhost:3000
# and automatically proxy API requests to http://localhost:5077
```

### 3. Verify Both Services are Running

1. **Backend API:** `http://localhost:5077`
   - Should display Swagger UI if configured
   - Test endpoint: `http://localhost:5077/weatherforecast`

2. **Frontend React App:** `http://localhost:3000`
   - Should display the My Guitar Shop homepage
   - Navigation and login functionality should work

## Testing the Setup

### 1. API Testing with HTTP Client

1. **Open `FinalProjectAPI.http` file**
2. **Test basic endpoints:**
   ```http
   ### Test Weather Forecast (default endpoint)
   GET http://localhost:5077/weatherforecast/
   Accept: application/json

   ### Test Get All Products
   GET http://localhost:5077/api/products
   Accept: application/json

   ### Test Get All Categories  
   GET http://localhost:5077/api/categories
   Accept: application/json
   ```

3. **Test Authentication:**
   ```http
   ### Test Customer Login (use actual customer data)
   POST http://localhost:5077/api/login/customer
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

### 2. Frontend Testing

1. **Navigate to `http://localhost:3000`**
2. **Test key functionality:**
   - Homepage loads with product listings
   - Navigation menu works
   - Login/Register forms display
   - Product browsing functionality
   - Category filtering (if implemented)

3. **Test User Registration:**
   - Create a new customer account
   - Verify account creation in database
   - Test login with new account

### 3. Database Verification

1. **Check Database Tables:**
   ```sql
   -- Verify MyGuitarShop tables
   USE MyGuitarShop;
   SELECT * FROM Categories;
   SELECT * FROM Products;
   SELECT * FROM Customers;

   -- Verify AP tables  
   USE AP;
   SELECT * FROM Vendors;
   SELECT * FROM Invoices;
   ```

2. **Test Stored Procedures:**
   ```sql
   -- Test key procedures
   EXEC GetCategories;
   EXEC GetAllProducts;
   EXEC GetAllVendors;
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues

**Error: "Cannot connect to SQL Server"**
- **Solution:** Verify SQL Server service is running
- Check connection string in `appsettings.Local.json`
- Ensure database names are correct (`MyGuitarShop`, `AP`)
- Test connection using SSMS with same credentials

**Error: "Login failed for user"**
- **Solution:** Check authentication method
- Use Windows Authentication: `Trusted_Connection=true`
- Or configure SQL Server Authentication with valid credentials

#### 2. .NET Build Issues

**Error: "The target framework 'net9.0' is not available"**
- **Solution:** Install .NET 9.0 SDK
- Verify installation: `dotnet --version`
- Update Visual Studio to support .NET 9.0

**Error: "Package restore failed"**
- **Solution:** Clear NuGet cache
```bash
dotnet nuget locals all --clear
dotnet restore
```

#### 3. React App Issues

**Error: "npm ERR! peer dep missing"**
- **Solution:** Install with legacy peer deps
```bash
npm install --legacy-peer-deps
```

**Error: "Module not found"**
- **Solution:** Delete node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 4. CORS Issues

**Error: "CORS policy blocked"**
- **Solution:** Ensure CORS is configured in `Program.cs`:
```csharp
app.UseCors(policy =>
{
    policy.AllowAnyOrigin();
    policy.AllowAnyHeader();
    policy.AllowAnyMethod();
});
```

#### 5. Port Conflicts

**Error: "Port already in use"**
- **Backend:** Change port in `launchSettings.json`
- **Frontend:** Change port in `package.json` scripts or use `PORT=3001 npm start`

### Debugging Tips

1. **Check Browser Developer Tools:**
   - Console tab for JavaScript errors
   - Network tab for API request failures
   - React Developer Tools for component issues

2. **Check API Logs:**
   - Console output when running `dotnet run`
   - Look for database connection errors
   - Check for missing stored procedures

3. **Verify Environment Variables:**
   - Confirm `ASPNETCORE_ENVIRONMENT=Development`
   - Check `appsettings.Local.json` is loaded

## Development Workflow

### 1. Daily Development Setup
```bash
# 1. Start SQL Server (if not auto-starting)
# 2. Start backend API
cd /path/to/FinalProjectAPI
dotnet run

# 3. In new terminal, start frontend
cd /path/to/FinalProjectAPI/client-app  
npm start
```

### 2. Making Changes

**Backend Changes:**
- Modify controllers, models, or infrastructure
- API automatically reloads on save (hot reload)
- Test changes using HTTP client or frontend

**Frontend Changes:**
- Modify React components
- Browser automatically refreshes on save
- Use React Developer Tools for debugging

**Database Changes:**
- Create new SQL scripts in `SQL Scripts` folder
- Execute scripts in SSMS
- Update corresponding stored procedure calls in code

### 3. Git Workflow (if using version control)
```bash
# Before making changes
git pull origin main

# After making changes
git add .
git commit -m "Description of changes"
git push origin main
```

## Production Deployment Considerations

### 1. Environment Configuration
- Create `appsettings.Production.json` with production connection strings
- Use environment variables for sensitive data
- Enable HTTPS and configure SSL certificates

### 2. Database Deployment
- Use SQL Server backup/restore for production database
- Implement database migration scripts
- Configure SQL Server for production (security, performance)

### 3. Application Deployment
- Build React app: `npm run build`
- Deploy .NET API to IIS or cloud service
- Serve React build files from web server
- Configure reverse proxy if needed

### 4. Security Considerations
- Remove development CORS settings
- Implement authentication tokens (JWT)
- Enable SQL Server security features
- Use HTTPS for all communication

## Additional Resources

### Documentation Files
- [Project Overview](ProjectOverview.md) - Complete project description
- [API Endpoints](APIEndpoints.md) - Detailed API documentation
- [Database Design](SQLDesign.md) - Database schema and relationships
- [Testing Plan](TestingPlan.md) - Comprehensive testing procedures

### Useful Commands
```bash
# .NET Commands
dotnet --version                    # Check .NET version
dotnet restore                      # Restore NuGet packages
dotnet build                        # Build project
dotnet run                          # Run application
dotnet clean                        # Clean build artifacts

# npm Commands  
npm --version                       # Check npm version
npm install                         # Install dependencies
npm start                           # Start development server
npm run build                       # Build for production
npm test                            # Run tests

# SQL Server Commands (Command Prompt)
sqlcmd -S localhost -E             # Connect to SQL Server
```

### Support and Troubleshooting
- Check console logs for both backend and frontend
- Use browser developer tools for debugging
- Verify all services are running on correct ports
- Ensure database connections are properly configured
- Test API endpoints individually before testing full application flow

---

**Note:** This setup assumes a Windows development environment. For macOS or Linux, adjust paths and commands accordingly, and ensure SQL Server is available (consider using Docker for SQL Server on non-Windows systems).
