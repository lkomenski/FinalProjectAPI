import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./NavBar.css";

function NavigationBar() {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const { cart } = useContext(CartContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      {/* LEFT: Logo/Home */}
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">My Guitar Shop</Link>
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
            {user.role === "customer" && (
              <>
                <Link to="/customer-dashboard" className="nav-link">My Dashboard</Link>
                <Link to="/customer-profile" className="nav-link">My Profile</Link>
              </>
            )}
            {user.role === "vendor" && (
              <Link to="/vendor-dashboard" className="nav-link">Vendor Dashboard</Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
            )}

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}

        {/* Cart Always Visible */}
        <Link to="/cart" className="nav-link cart-link">
          🛒 Cart ({cart.length})
        </Link>
      </div>
    </nav>
  );
}

export default NavigationBar;
