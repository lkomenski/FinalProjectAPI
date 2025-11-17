# My Guitar Shop - Client Application

A React-based frontend for the Guitar Shop Management System, providing separate interfaces for customers, vendors, and administrators to manage products, orders, and business operations.

## 🎯 Project Overview

This client application is part of a comprehensive Guitar Shop Management System. For detailed project specifications, architecture, and business requirements, see [📋 ProjectOverview.md](../Documentation/ProjectOverview.md).

**Key Application Areas:**
- **Customer Portal**: Browse products, manage shopping cart, view order history, update profile
- **Vendor Dashboard**: Manage product inventory, view sales analytics, handle vendor operations  
- **Admin Panel**: Comprehensive business oversight, user management, system analytics
- **Authentication System**: Role-based access with secure login/registration

## 🛠 Technology Stack

- **Frontend**: React 18.x with functional components and hooks
- **Routing**: React Router v6 for SPA navigation
- **Styling**: Custom CSS with responsive design
- **State Management**: React Context API for cart and user state
- **HTTP Client**: Fetch API for REST API communication
- **Build Tool**: Create React App (Webpack, Babel)

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Running backend API (ASP.NET Core Web API)

> 📖 **Complete Setup Guide**: For full development environment setup including database configuration, API setup, and troubleshooting, see [🔧 SetupInstructions.md](../Documentation/SetupInstructions.md)

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

## 📁 Project Structure

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
│   ├── RegisterForm.js  # User registration
│   ├── ResetPassword.js # Password reset functionality
│   ├── ChangePasswordModal.js # Password change modal
│   ├── CustomerDashboard.js   # Customer account overview
│   ├── CustomerProfile.js     # Customer profile management
│   ├── VendorDashboard.js     # Vendor business analytics
│   ├── VendorAccount.js       # Vendor profile management
│   ├── VendorForm.js          # Vendor registration/editing
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
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Base CSS styles
```

## 🔑 Key Features

### Customer Features
- **Product Browsing**: Featured products, categories, search functionality
- **Shopping Cart**: Persistent cart with user-specific storage
- **User Account**: Registration, login, profile management, order history
- **Password Security**: Secure password reset and change functionality

### Vendor Features  
- **Product Management**: Add, edit, delete products with image upload
- **Dashboard Analytics**: Sales metrics, product performance
- **Account Management**: Profile updates, business information

### Admin Features
- **System Overview**: Comprehensive business metrics and KPIs
- **User Management**: Customer and vendor account oversight
- **Product Oversight**: System-wide inventory management
- **Business Intelligence**: Sales analytics and reporting

## 🔗 API Integration

The frontend communicates with the ASP.NET Core Web API:
- **Base URL**: `http://localhost:5077/api`
- **Authentication**: Role-based with customer/vendor/admin endpoints
- **Data Format**: JSON REST API
- **Error Handling**: Comprehensive error messaging and validation

> 📚 **Complete API Documentation**: For detailed endpoint specifications, request/response schemas, and testing examples, see [🔌 APIEndpoints.md](../Documentation/APIEndpoints.md)

### Key API Endpoints
```
GET    /api/products              # Get all products
GET    /api/categories            # Get product categories  
POST   /api/customer/login        # Customer authentication
GET    /api/dashboard/customer/:id # Customer dashboard data
PUT    /api/customer/change-password # Change customer password
POST   /api/products              # Add new product (admin)
```

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with flexible layouts
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **User Experience**: Intuitive navigation, loading states, error handling
- **Visual Design**: Modern card-based layouts with consistent styling
- **Interactive Elements**: Modals, carousels, dynamic filtering

## 🛡 Security Features

- **Password Requirements**: 8+ characters with number requirement
- **Input Validation**: Client and server-side validation
- **Secure Storage**: Sensitive data handled appropriately
- **Role Protection**: Route guards for different user types
- **CSRF Protection**: Secure form submissions

## 🧪 Development Scripts

```bash
# Development server with hot reload
npm start

# Run test suite
npm test

# Production build
npm run build

# Analyze bundle size
npm run build && npx serve -s build
```

> 🧪 **Testing Documentation**: For comprehensive testing procedures, API testing examples, and quality assurance guidelines, see [✅ TestingPlan.md](../Documentation/TestingPlan.md)

## 📋 Dependencies

### Core Dependencies
- `react` & `react-dom` - Core React framework
- `react-router-dom` - Client-side routing
- `react-scripts` - Build tools and configuration

### Development Features
- Hot module replacement for fast development
- ESLint integration for code quality
- Automatic browser refresh on file changes
- Source maps for debugging

## 🚀 Deployment

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

## 📚 Additional Documentation

Comprehensive project documentation is available in the `/Documentation` folder:

- **[📋 ProjectOverview.md](../Documentation/ProjectOverview.md)** - Complete project specifications, goals, and architecture
- **[🔧 SetupInstructions.md](../Documentation/SetupInstructions.md)** - Full development environment setup guide
- **[🔌 APIEndpoints.md](../Documentation/APIEndpoints.md)** - Complete REST API documentation with examples
- **[🏗️ SQLDesign.md](../Documentation/SQLDesign.md)** - Database schema, relationships, and stored procedures
- **[✅ TestingPlan.md](../Documentation/TestingPlan.md)** - Testing procedures, API testing, and QA guidelines
- **[🎯 OOPConceptsSummary.md](../Documentation/OOPConceptsSummary.md)** - Object-oriented programming implementation details

## 📞 Support & Maintenance

For issues, feature requests, or contributions:
- Review the comprehensive documentation above
- Check existing issues and solutions in the project files
- Contact development team for system support

---

**Author**: Leena Komenski  
**Course**: Final Project - Guitar Shop Management System  
**Date**: November 2025
