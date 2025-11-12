import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, decreaseQuantity, addToCart, clearCart } = useContext(CartContext);

  const total = cart.reduce(
    (sum, item) => sum + item.listPrice * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-gray-500">Browse products to add items.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>

      {cart.map((item) => (
        <div
          key={item.productID}
          className="flex justify-between items-center border-b py-4"
        >
          <div>
            <h3 className="font-semibold">{item.productName}</h3>
            <p>${item.listPrice.toFixed(2)}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="px-2 bg-gray-300 rounded"
                onClick={() => decreaseQuantity(item.productID)}
              >
                -
              </button>

              <span>{item.quantity}</span>

              <button
                className="px-2 bg-gray-300 rounded"
                onClick={() => addToCart(item)}
              >
                +
              </button>
            </div>
          </div>

          <button
            className="text-red-600"
            onClick={() => removeFromCart(item.productID)}
          >
            Remove
          </button>
        </div>
      ))}

      <h3 className="text-xl font-bold mt-6">
        Total: ${total.toFixed(2)}
      </h3>

      <button
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() => alert("Checkout is not implemented")}
      >
        Checkout
      </button>

      <button
        className="mt-4 ml-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={clearCart}
      >
        Clear Cart
      </button>
    </div>
  );
}
