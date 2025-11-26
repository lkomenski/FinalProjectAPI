import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import "../../Styles/NavBar.css";

function NavigationBar() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem("user");
    localStorage.clear();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "customer") return "/customer-dashboard";
    if (user.role === "vendor") return "/vendor-dashboard";
    if (user.role === "admin") return "/admin-dashboard";
    return "/";
  };

  return (
    <nav className="navbar">
      {/* LEFT: Logo/Home */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">My Guitar Shop</Link>
        <Link to="/" className="navbar-home-link">Home</Link>
      </div>

      {/* RIGHT: User controls */}
      <div className="navbar-right">

        {/* Guest View */}
        {!user && (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link nav-register">Register</Link>
          </>
        )}

        {/* Logged-In View */}
        {user && (
          <>
            <span className="welcome-text">Welcome, {user.firstName}!</span>
            
            {/* User Menu */}
            <div 
              className="user-menu-container"
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <button className="menu-button">
                ☰
              </button>
              
              {isMenuOpen && (
                <div className="user-menu-dropdown">
                  <Link 
                    to={getDashboardLink()} 
                    className="menu-dropdown-item"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }} 
                    className="menu-dropdown-item menu-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cart Visible for Customers and Guests Only */}
        {(!user || user.role === "customer") && (
          <Link to="/cart" className="nav-link cart-link">
            🛒 Cart ({cart.length})
          </Link>
        )}
      </div>
    </nav>
  );
}

export default NavigationBar;
