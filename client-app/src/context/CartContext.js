import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage and set up cart for that user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        loadUserCart(user.id);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setCurrentUser(null);
        setCart([]);
      }
    } else {
      // No user logged in, load guest cart
      setCurrentUser(null);
      loadGuestCart();
    }
    setIsInitialized(true);
  }, []);

  // Function to load cart for specific user
  const loadUserCart = (userId) => {
    if (!userId) {
      setCart([]);
      return;
    }
    
    const userCartKey = `cart_user_${userId}`;
    const storedCart = localStorage.getItem(userCartKey);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCart(parsed);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  // Function to load guest cart (before login)
  const loadGuestCart = () => {
    const guestCartKey = 'cart_guest';
    const storedCart = localStorage.getItem(guestCartKey);
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCart(parsed);
      } catch (error) {
        console.error("Failed to parse guest cart from localStorage:", error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  // Monitor for user changes (login/logout)
  useEffect(() => {
    if (!isInitialized) return; // Don't run until initial load is complete
    
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      const storedUserId = storedUser ? JSON.parse(storedUser).id : null;
      const currentUserId = currentUser ? currentUser.id : null;
      
      // Only act if user actually changed
      if (storedUserId !== currentUserId) {
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            // Don't load cart here - let refreshUserCart handle it
          } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
          }
        } else {
          // User logged out - keep cart in memory but switch to guest mode
          setCurrentUser(null);
          // Cart stays in memory and will be saved to guest cart by save effect
        }
      }
    };

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for user changes in same tab
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser, isInitialized]);

  // Save cart automatically whenever it changes (user-specific or guest)
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const userCartKey = `cart_user_${currentUser.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cart));
    } else {
      // Save guest cart
      const guestCartKey = 'cart_guest';
      localStorage.setItem(guestCartKey, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // Add item to cart (works for both logged-in users and guests)
  const addToCart = (product) => {
    // Prevent vendors and employees from adding to cart
    if (currentUser && (currentUser.role === 'vendor' || currentUser.role === 'admin')) {
      console.warn('Vendors and employees cannot add items to cart');
      return;
    }
    
    setCart((prev) => {
      const productId = product.productID || product.ProductID;
      const existing = prev.find((p) => (p.productID || p.ProductID) === productId);
      if (existing) {
        return prev.map((p) =>
          (p.productID || p.ProductID) === productId
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      // Normalize the product to use camelCase and add quantity
      const normalizedProduct = {
        productID: productId,
        ProductID: productId, // Keep both for compatibility
        productName: product.productName || product.ProductName,
        ProductName: product.productName || product.ProductName,
        listPrice: product.listPrice || product.ListPrice,
        ListPrice: product.listPrice || product.ListPrice,
        imageURL: product.imageURL || product.ImageURL,
        ImageURL: product.imageURL || product.ImageURL,
        quantity: 1
      };
      return [...prev, normalizedProduct];
    });
  };

  // Remove an item completely
  const removeFromCart = (productID) => {
    setCart((prev) => prev.filter((p) => (p.productID || p.ProductID) !== productID));
  };

  // Decrease quantity
  const decreaseQuantity = (productID) => {
    setCart((prev) =>
      prev
        .map((p) =>
          (p.productID || p.ProductID) === productID
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  // Clear all cart items
  const clearCart = () => {
    setCart([]);
  };

  // Function to manually refresh user cart and merge with stored cart (called after login)
  const refreshUserCart = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        
        // Get the cart that's currently in memory before we change anything
        const cartBeforeLogin = [...cart];
        
        // Update current user
        setCurrentUser(user);
        
        // Load user's saved cart from storage
        const userCartKey = `cart_user_${user.id}`;
        const userCartStr = localStorage.getItem(userCartKey);
        let savedUserCart = [];
        if (userCartStr) {
          try {
            savedUserCart = JSON.parse(userCartStr);
          } catch (e) {
            console.error("Failed to parse user cart:", e);
          }
        }
        
        // Merge the cart from memory (before login) with saved user cart
        const mergedCart = [...savedUserCart];
        cartBeforeLogin.forEach(memoryItem => {
          const memoryId = memoryItem.productID || memoryItem.ProductID;
          const existingItem = mergedCart.find(item => 
            (item.productID || item.ProductID) === memoryId
          );
          
          if (existingItem) {
            // Increase quantity if item already in user cart
            existingItem.quantity += memoryItem.quantity;
          } else {
            // Add new item from memory cart
            mergedCart.push(memoryItem);
          }
        });
        
        // Set merged cart and save it
        setCart(mergedCart);
        localStorage.setItem(userCartKey, JSON.stringify(mergedCart));
        
        // Clear guest cart after merging
        localStorage.removeItem('cart_guest');
        
      } catch (error) {
        console.error("Failed to refresh user cart:", error);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        decreaseQuantity, 
        clearCart,
        currentUser,
        refreshUserCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
