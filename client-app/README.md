# My Guitar Shop - Client Application

A React-based frontend for the Guitar Shop Management System, providing separate interfaces for customers, vendors, and administrators to manage products, orders, and business operations.

##  Project Overview

This client application is part of a comprehensive Guitar Shop Management System. For detailed project specifications, architecture, and business requirements, see [ProjectOverview.md](../Documentation/ProjectOverview.md).

**Key Application Areas:**
- **Customer Portal**: Browse products, manage shopping cart, view order history, update profile with password management
- **Vendor Dashboard**: Manage product inventory, view sales analytics, handle invoices and vendor operations  
- **Admin Panel**: Comprehensive business oversight, user management, system analytics
- **Authentication System**: Role-based access with secure login/registration, BCrypt password encryption
- **Vendor Registration**: Dedicated vendor registration form with business information
- **Password Security**: Complete password reset flow and change password functionality

## 🛠 Technology Stack

- **Frontend**: React 19.x with functional components and hooks
- **Routing**: React Router v7 for SPA navigation
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context API for cart and user state
- **HTTP Client**: Fetch API for REST API communication
- **Build Tool**: Create React App (Webpack, Babel)
- **UI Components**: React Slick for carousels and image galleries

##  Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Running backend API (ASP.NET Core Web API on .NET 9.0)

>  **Complete Setup Guide**: For full development environment setup including database configuration, API setup, and troubleshooting, see [SetupInstructions.md](../Documentation/SetupInstructions.md)

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   Opens [http://localhost:3000](http://localhost:3000) in your browser

3. **Production Build**
   ```bash
   npm run build
   ```

##  Project Structure

```
src/
├── components/           # React components
│   ├── Api.js           # API service functions
│   ├── HomePage.js      # Main product browsing page
│   ├── NavBar.js        # Navigation component
│   ├── CartPage.js      # Shopping cart management
│   ├── CheckoutPage.js  # Order checkout process
│   ├── ProductCard.js   # Product display component
│   ├── ProductDetails.js # Individual product view
│   ├── ProductForm.js   # Product management form (admin)
│   ├── LoginForm.js     # User authentication
│   ├── RegisterForm.js  # Customer registration
│   ├── ResetPassword.js # Password reset functionality
│   ├── ChangePasswordModal.js # Password change modal
│   ├── CustomerDashboard.js   # Customer account overview
│   ├── CustomerProfile.js     # Customer profile management
│   ├── VendorDashboard.js     # Vendor business analytics
│   ├── VendorAccount.js       # Vendor profile management
│   ├── VendorForm.js          # Vendor account editing
│   ├── VendorRegisterForm.js  # Vendor registration form
│   ├── VendorInvoices.js      # Vendor invoice listing
│   ├── VendorInvoiceDetail.js # Individual invoice view
│   ├── EmployeeDashboard.js   # Admin/employee panel
│   ├── ProtectedRoute.js      # Route authentication guard
│   ├── ConfirmationModal.js   # Confirmation dialogs
│   └── shared/               # Reusable UI components
│       ├── LoadingSpinner.js # Loading state indicator
│       └── ErrorMessage.js   # Error display component
├── Styles/              # CSS stylesheets
│   ├── App.css          # Global application styles
│   ├── Auth.css         # Authentication form styles
│   ├── Dashboard.css    # Dashboard component styles
│   ├── HomePage.css     # Homepage layout styles
│   ├── NavBar.css       # Navigation bar styles
│   ├── CartPage.css     # Shopping cart styles
│   ├── CheckoutPage.css # Checkout process styles
│   ├── ProductCard.css  # Product display styles
│   ├── ProductDetails.css # Product detail page styles
│   ├── ProfilePage.css  # User profile styles
│   ├── ConfirmationModal.css # Modal dialog styles
│   └── modal.css        # General modal styles
├── context/             # React Context providers
│   └── CartContext.js   # Shopping cart state management
├── App.js               # Main application component with routing
├── App.css              # Main application styles
├── index.js             # Application entry point
└── index.css            # Base CSS styles
```

##  Key Features

### Customer Features
- **Product Browsing**: Featured products, categories, search functionality with image carousels
- **Shopping Cart**: Persistent cart with user-specific storage and real-time updates
- **User Account**: Registration, login, profile management, order history
- **Password Security**: Secure password reset via email and in-app password change functionality
- **Address Management**: Multiple shipping addresses with default selection
- **Order History**: Complete purchase history with order details and status tracking

### Vendor Features  
- **Vendor Registration**: Dedicated registration form with business information and contact details
- **Product Management**: Add, edit, delete products with image upload capabilities
- **Dashboard Analytics**: Sales metrics, revenue tracking, product performance analytics
- **Invoice Management**: View detailed invoice history with payment terms and due dates
- **Account Management**: Profile updates, business information, contact details
- **Order Tracking**: View orders containing vendor products

### Admin Features
- **System Overview**: Comprehensive business metrics and KPIs with real-time data
- **User Management**: Customer and vendor account oversight and management
- **Product Oversight**: System-wide inventory management and product activation
- **Business Intelligence**: Sales analytics, revenue reporting, and performance metrics
- **Category Management**: Organize and manage product categories
- **System Administration**: Full CRUD operations across all entities

##  API Integration

The frontend communicates with the ASP.NET Core Web API:
- **Base URL**: `http://localhost:5077/api`
- **Authentication**: BCrypt password hashing with role-based access (customer/vendor/admin)
- **Data Format**: JSON REST API
- **Error Handling**: Comprehensive error messaging and validation
- **Security**: Password encryption using BCrypt.Net-Next package

>  **Complete API Documentation**: For detailed endpoint specifications, request/response schemas, and testing examples, see [APIEndpoints.md](../Documentation/APIEndpoints.md)

### Key API Endpoints
```
# Authentication
POST   /api/auth/login               # Universal login with role selection
POST   /api/auth/customer/login      # Customer-specific authentication
POST   /api/auth/vendor/login        # Vendor-specific authentication

# Customer Management
POST   /api/customer/register        # Customer registration with BCrypt
GET    /api/customer/:id             # Get customer details
PUT    /api/customer/:id             # Update customer profile
PUT    /api/customer/change-password # Change password with verification
GET    /api/dashboard/customer/:id   # Customer dashboard data

# Product Management
GET    /api/products                 # Get all products
GET    /api/products/featured        # Get featured products
GET    /api/products/:id             # Get product details
POST   /api/products                 # Add new product (admin)
PUT    /api/products/:id             # Update product
DELETE /api/products/:id             # Delete product

# Vendor Management
POST   /api/vendors/register         # Vendor registration
GET    /api/vendors/:id              # Get vendor details
PUT    /api/vendors/:id              # Update vendor profile
GET    /api/vendors/:id/invoices     # Get vendor invoices
GET    /api/dashboard/vendor/:id     # Vendor dashboard analytics

# Categories
GET    /api/categories               # Get all categories
GET    /api/categories/:id/products  # Get products by category

# Password Reset
POST   /api/password-reset/request   # Request password reset
POST   /api/password-reset/reset     # Reset password with token
```

##  UI/UX Features

- **Responsive Design**: Mobile-first approach with flexible layouts and breakpoints
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation and ARIA labels
- **User Experience**: Intuitive navigation, loading states, error handling, and success messages
- **Visual Design**: Modern card-based layouts with consistent styling and color schemes
- **Interactive Elements**: Modals, carousels (react-slick), dynamic filtering, and real-time updates
- **Image Galleries**: Product image carousels with navigation controls
- **Form Validation**: Client-side validation with clear error messages
- **Loading States**: Spinners and skeleton screens for better perceived performance

##  Security Features

- **Password Encryption**: BCrypt password hashing on backend (BCrypt.Net-Next)
- **Password Requirements**: 8+ characters with complexity validation
- **Input Validation**: Client and server-side validation for all forms
- **Secure Storage**: Session storage for user authentication tokens
- **Role Protection**: Route guards (ProtectedRoute component) for different user types
- **CSRF Protection**: Secure form submissions with proper headers
- **Password Reset Flow**: Secure token-based password reset via email
- **Session Management**: Automatic logout on token expiration

##  Development Scripts

```bash
# Start development server with hot reload
npm start

# Run test suite with coverage
npm test

# Build optimized production bundle
npm run build

# Analyze bundle size and dependencies
npm run build && npx serve -s build
```

>  **Testing Documentation**: For comprehensive testing procedures, API testing examples, and quality assurance guidelines, see [TestingPlan.md](../Documentation/TestingPlan.md)

##  Dependencies

### Core Dependencies
- `react` (^19.2.0) & `react-dom` (^19.2.0) - Core React framework
- `react-router` (^7.9.5) & `react-router-dom` (^7.9.5) - Client-side routing and navigation
- `react-scripts` (5.0.1) - Build tools and configuration
- `react-slick` (^0.31.0) - Carousel component for image galleries
- `slick-carousel` (^1.8.1) - Carousel styles and functionality

### Testing Dependencies
- `@testing-library/react` (^16.3.0) - React component testing utilities
- `@testing-library/jest-dom` (^6.9.1) - Custom Jest matchers
- `@testing-library/dom` (^10.4.1) - DOM testing utilities
- `@testing-library/user-event` (^13.5.0) - User interaction simulation

### Development Features
- Hot module replacement for fast development
- ESLint integration for code quality
- Automatic browser refresh on file changes
- Source maps for debugging
- Web vitals tracking for performance monitoring

##  Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy Options**
   - **Netlify**: Drag and drop `build/` folder
   - **Vercel**: Connect GitHub repository for auto-deployment
   - **IIS/Apache**: Serve static files from `build/` directory
   - **AWS S3**: Upload build folder to S3 bucket with static hosting

3. **Environment Configuration**
   - Update API base URLs for production environment
   - Configure CORS settings on backend API
   - Set up domain and SSL certificates

##  Additional Documentation

Comprehensive project documentation is available in the `/Documentation` folder:

- **[ProjectOverview.md](../Documentation/ProjectOverview.md)** - Complete project specifications, goals, and architecture
- **[SetupInstructions.md](../Documentation/SetupInstructions.md)** - Full development environment setup guide
- **[APIEndpoints.md](../Documentation/APIEndpoints.md)** - Complete REST API documentation with examples
- **[SQLDesign.md](../Documentation/SQLDesign.md)** - Database schema, relationships, and stored procedures
- **[TestingPlan.md](../Documentation/TestingPlan.md)** - Testing procedures, API testing, and QA guidelines
- **[OOPConceptsSummary.md](../Documentation/OOPConceptsSummary.md)** - Object-oriented programming implementation details

##  Support & Maintenance

For issues, feature requests, or contributions:
- Review the comprehensive documentation above
- Check existing issues and solutions in the project files
- Contact development team for system support

---

**Author**: Leena Komenski  
**Course**: Final Project - Guitar Shop Management System  
**Date**: November 2025
