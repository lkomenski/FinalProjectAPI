import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../Styles/CartPage.css";  // ⭐ Add this

export default function CartPage() {
  const { cart, removeFromCart, decreaseQuantity, addToCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) => sum + (item.listPrice || item.ListPrice) * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="cart-empty-container">
        <h2>Your Cart is Empty</h2>
        <p>Browse products to add items.</p>
      </div>
    );
  }

  return (
    <div className="cart-container">

      <h2 className="cart-title">Your Shopping Cart</h2>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.productID || item.ProductID} className="cart-item">

            {/* Thumbnail */}
            <img
              src={item.imageURL || item.ImageURL || "/placeholder.png"}
              alt={item.productName || item.ProductName}
              className="cart-item-img"
            />

            {/* Info */}
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.productName || item.ProductName}</h3>
              <p className="cart-item-price">${(item.listPrice || item.ListPrice).toFixed(2)}</p>

              <div className="cart-qty-row">
                <button
                  className="qty-btn"
                  onClick={() => decreaseQuantity(item.productID || item.ProductID)}
                >
                  -
                </button>

                <span className="cart-qty">{item.quantity}</span>

                <button
                  className="qty-btn"
                  onClick={() => addToCart(item)}
                >
                  +
                </button>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.productID || item.ProductID)}
              >
                Remove
              </button>
            </div>

            {/* Item Total */}
            <div className="cart-item-total">
              ${((item.listPrice || item.ListPrice) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="cart-summary">
        <h3 className="cart-summary-total">Total: ${total.toFixed(2)}</h3>

        <div className="cart-summary-buttons">
          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>


          <button
            className="clear-btn"
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>

    </div>
  );
}
