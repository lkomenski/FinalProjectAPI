// src/components/NavigationBar.js
import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";

function NavigationBar() {
  const { cart } = useContext(CartContext);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🎸 My Guitar Shop</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
      <Link to="/cart" className="cart-link">
        🛒 Cart ({cart.length})
      </Link>
    </nav>
  );
}

export default NavigationBar;
