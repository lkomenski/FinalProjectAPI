# Comprehensive Testing Checklist for Final Project Submission

## ✅ = Completed | ❌ = Failed | ⚠️ = Needs Attention

---

## 🔐 1. AUTHENTICATION & SECURITY TESTING


### Vendor Authentication
- [ ] Admin can generate vendor registration token
- [ ] Token modal displays correctly with:
  - [ ] Vendor information
  - [ ] Token string
  - [ ] Copy button works
  - [ ] Expiration time shown (48 hours)
  - [ ] Security warnings visible
- [ ] Vendor can register using valid token
- [ ] Vendor registration fails with expired token (wait 48+ hours OR manually set expiry in past)
- [ ] Vendor registration fails with already-used token
- [ ] Vendor registration fails if token/email mismatch
- [ ] Vendor registration fails if vendor already has account
- [ ] Token is cleared from database after successful registration
- [ ] Password is hashed in Vendors table (BCrypt hash)
- [ ] Vendor can login with correct credentials
- [ ] Vendor redirected to vendor dashboard after login
- [ ] Vendor stays logged in after refresh
- [ ] Vendor can logout successfully


### Password Reset Flow
- [ ] Customer can request password reset (receives token)
- [ ] Reset token generated and stored in database
- [ ] Customer can reset password with valid token
- [ ] Reset fails with invalid/expired token
- [ ] Customer can login with new password
- [ ] Token cleared from database after successful reset

### Token Security Verification (IMPORTANT!)
- [ ] Check Vendors table: RegistrationToken and RegistrationTokenExpiry columns exist
- [ ] Generate token: Verify RegistrationTokenExpiry is set to 48 hours from now
- [ ] Register vendor: Verify both RegistrationToken and RegistrationTokenExpiry are NULL after registration
- [ ] Regenerate token: Verify old token is replaced with new one
- [ ] Token is GUID format (32 characters with hyphens)
- [ ] Token is NOT displayed anywhere except secure modal
- [ ] Token modal closes and token cannot be retrieved again from UI

---


---



---

## 👨‍💼 4. ADMIN/EMPLOYEE FUNCTIONALITY TESTING


### Product Management

- [ ] Form validation works for all fields
- [ ] Can edit existing product
- [ ] Edit modal auto-populates with current data
- [ ] Can save changes successfully
- [ ] Can activate inactive product
- [ ] Can deactivate active product


### Vendor Management

- [ ] Can generate registration token
- [ ] Can activate/deactivate vendor


### Category Management
- [ ] Can view all categories
- [ ] Can add new category
- [ ] Can edit category name
- [ ] Categories appear in product dropdown




### Forms
- [ ] All required fields marked with asterisk (*)
- [ ] Character counters show for fields with maxLength
- [ ] Validation messages display clearly
- [ ] Error messages are helpful
- [ ] Success messages appear after save
- [ ] Loading states show during API calls
- [ ] Forms clear/reset appropriately
- [ ] Dropdown menus populate correctly
- [ ] Date fields format correctly
- [ ] Numeric fields only accept numbers

---

## 🔒 6. AUTHORIZATION & ROUTE PROTECTION

### Protected Routes

- [ ] Redirects to appropriate dashboard if wrong role tries to access
- [ ] Redirects to login if not authenticated
- [ ] Cannot access protected routes by typing URL directly

### Role-Based Access Control
- [ ] Customer cannot access admin routes
- [ ] Customer cannot access vendor routes
- [ ] Vendor cannot access admin routes
- [ ] Vendor cannot access customer shopping features
- [ ] Admin cannot use shopping cart
- [ ] API endpoints respect role restrictions (test in browser DevTools)

---

## 💾 7. DATA PERSISTENCE & VALIDATION

### Database Operations
- [ ] New records save correctly
- [ ] Updates save correctly
- [ ] Soft deletes work (IsActive = 0)
- [ ] Activations work (IsActive = 1)
- [ ] DateUpdated field updates on changes
- [ ] Foreign key relationships maintained
- [ ] No orphaned records created

### Form Validation
- [ ] Required fields cannot be empty
- [ ] Email fields validate email format
- [ ] Phone fields validate phone format (10 digits)
- [ ] Zip code validates format (5 digits)
- [ ] State validates format (2 letters)
- [ ] Numeric fields don't accept letters
- [ ] Discount percent between 0-100
- [ ] Character limits enforced
- [ ] Alphanumeric validation where applicable

---

---

## 🐛 9. ERROR HANDLING & EDGE CASES

### API Error Handling
- [ ] Network errors show user-friendly message
- [ ] 404 errors handled gracefully
- [ ] 500 errors show appropriate message
- [ ] Validation errors from API displayed clearly
- [ ] Timeout errors handled
- [ ] Loading states prevent multiple submissions

### Edge Cases
- [ ] Empty cart checkout handled (if applicable)
- [ ] Product with 0 quantity handled
- [ ] Very long text in fields doesn't break layout
- [ ] Special characters in search don't break
- [ ] Rapid clicking doesn't create duplicates
- [ ] Browser back button works correctly
- [ ] Page refresh maintains state (where appropriate)
- [ ] Multiple tabs don't conflict (cart, login state)

### Null/Empty Data
- [ ] Empty product list shows message
- [ ] Empty vendor list shows message
- [ ] Empty invoice list shows message
- [ ] No search results shows message
- [ ] Null values in database don't crash app
- [ ] Missing images show placeholder

---


### Console & DevTools Check
- [ ] No JavaScript errors in console
- [ ] No unhandled promise rejections
- [ ] API calls return expected data
- [ ] Network tab shows successful requests
- [ ] React DevTools shows no warnings (if using React)

---

## 🎯 11. BUSINESS LOGIC TESTING


### Inventory Management
- [ ] Quantity on hand displays correctly
- [ ] Cannot add more to cart than available (if implemented)
- [ ] Quantity updates after order (if implemented)
- [ ] Out of stock items handled appropriately

### Vendor/Customer Status
- [ ] Inactive vendors cannot login
- [ ] Inactive customers cannot login
- [ ] Inactive products don't show on storefront
- [ ] Inactive entities still appear in admin views
- [ ] Reactivation works correctly

---

## 📝 12. DOCUMENTATION REVIEW

### Code Documentation
- [ ] README.md complete with:
  - [ ] Project description
  - [ ] Technologies used
  - [ ] Setup instructions
  - [ ] How to run the application
  - [ ] Database setup instructions
- [ ] APIEndpoints.md lists all endpoints
- [ ] SQL scripts documented with comments
- [ ] C# code has XML documentation comments
- [ ] JavaScript/React components documented

### Architecture Documentation
- [ ] OOP concepts explained
- [ ] Architecture decisions documented
- [ ] Database design documented
- [ ] Security implementation documented
- [ ] Testing plan available

### Clean Code Review
- [ ] No commented-out code
- [ ] No console.log statements (or minimal/documented)
- [ ] No TODO comments unresolved
- [ ] Consistent naming conventions
- [ ] No unused imports
- [ ] No unused variables
- [ ] Proper indentation

---

## 📊 TESTING NOTES & RESULTS

### Issues Found
```
Issue #1: [Description]
Status: [Fixed/Pending]
Notes: [Details]

Issue #2: [Description]
Status: [Fixed/Pending]
Notes: [Details]
```


---

## 🔐 TOKEN SECURITY - DETAILED VERIFICATION

### Understanding How Token Security Works:

**1. Token Generation (Admin Side)**
   - Admin clicks "Generate Token" in vendor detail modal
   - System creates a GUID (globally unique identifier) - looks like: `a3f5b2c1-4e6d-7f8a-9b0c-1d2e3f4a5b6c`
   - System sets expiration to exactly 48 hours from now
   - System saves BOTH the token AND expiration time to Vendors table
   - Token displays in modal with copy button
   - Modal closes, token is NOT retrievable again from UI

**2. Token Storage (Database)**
   ```sql
   -- In Vendors table:
   RegistrationToken: 'a3f5b2c1-4e6d-7f8a-9b0c-1d2e3f4a5b6c'
   RegistrationTokenExpiry: '2025-11-27 14:30:00.000'
   ```

**3. Token Transmission (Manual)**
   - Admin copies token from modal
   - Admin sends token to vendor via encrypted email
   - Token is NOT stored anywhere in the UI
   - Token is NOT logged anywhere public

**4. Token Validation (Vendor Registration)**
   When vendor tries to register:
   - System checks if token exists in Vendors table
   - System checks if current time < RegistrationTokenExpiry
   - System checks if vendor email matches token's vendor email
   - System checks if vendor doesn't already have account (no Password field)
   - ALL checks must pass

**5. Token Cleanup (After Registration)**
   - When registration succeeds:
     ```sql
     UPDATE Vendors 
     SET RegistrationToken = NULL,
         RegistrationTokenExpiry = NULL,
         Password = '[hashed_password]'
     WHERE VendorID = @VendorID
     ```
   - Token and expiry both set to NULL
   - Cannot be used again

**6. Token Regeneration**
   - If admin generates new token for same vendor:
   - Old token is REPLACED (overwritten)
   - Old token becomes invalid immediately
   - New expiration time set
   - Only one active token per vendor

### What to Check in Database:

**Before Registration:**
```sql
SELECT VendorID, VendorName, VendorEmail, 
       RegistrationToken, RegistrationTokenExpiry, Password
FROM Vendors 
WHERE VendorID = [your_test_vendor_id];
```
Should see:
- RegistrationToken = [some GUID]
- RegistrationTokenExpiry = [date 48 hours in future]
- Password = NULL

**After Registration:**
```sql
SELECT VendorID, VendorName, VendorEmail, 
       RegistrationToken, RegistrationTokenExpiry, Password
FROM Vendors 
WHERE VendorID = [your_test_vendor_id];
```
Should see:
- RegistrationToken = NULL
- RegistrationTokenExpiry = NULL  
- Password = [BCrypt hash starting with $2a$ or $2b$]

### Common Token Security Issues to Test:

- [ ] **Expired Token**: Try to register with token after 48 hours (should fail)
- [ ] **Reused Token**: Register once, try to use same token again (should fail)
- [ ] **Wrong Email**: Try to register with token but different email (should fail)
- [ ] **Already Registered**: Try to use token for vendor who already has account (should fail)
- [ ] **Invalid Token**: Try random GUID that's not in database (should fail)
- [ ] **Token Replacement**: Generate token, generate again, verify first token invalid
- [ ] **Token Cleanup**: Verify token is NULL after successful registration

---
