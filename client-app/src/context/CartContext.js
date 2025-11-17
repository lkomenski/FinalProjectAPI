import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
      // No user logged in, clear cart
      setCurrentUser(null);
      setCart([]);
    }
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

  // Monitor for user changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (!currentUser || user.id !== currentUser.id) {
            setCurrentUser(user);
            loadUserCart(user.id);
          }
        } catch (error) {
          console.error("Failed to parse user from localStorage:", error);
        }
      } else {
        // User logged out
        setCurrentUser(null);
        setCart([]);
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
  }, [currentUser]);

  // Save cart automatically whenever it changes (user-specific)
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const userCartKey = `cart_user_${currentUser.id}`;
      localStorage.setItem(userCartKey, JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  // Add item to cart (only if user is logged in)
  const addToCart = (product) => {
    if (!currentUser) {
      alert("Please log in to add items to your cart.");
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

  // Function to manually refresh user cart (useful after login)
  const refreshUserCart = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        loadUserCart(user.id);
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
