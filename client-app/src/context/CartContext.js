import React, { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on page load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCart(parsed);
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
        setCart([]);
      }
    }
  }, []);

  // Save cart automatically whenever it changes
  useEffect(() => {
    if (cart.length >= 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (product) => {
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

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, decreaseQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
