import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorMessage from "./shared/ErrorMessage";
import { fetchData } from "./Api";
import { CartContext } from "../context/CartContext";
import { useContext } from "react";

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchData(`products/${productId}`);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  if (!product) return <ErrorMessage message="Product not found." />;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <img
          src={product.imageUrl || "/placeholder.png"}
          alt={product.productName}
          className="w-full md:w-1/2 rounded-lg shadow"
        />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {product.productName}
          </h1>

          <p className="text-xl text-green-700 font-semibold mb-2">
            ${product.listPrice?.toFixed(2)}
          </p>

          <p className="text-gray-600 mb-4">
            Category: {product.categoryName}
          </p>

          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Add to Cart button */}

         <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => addToCart(product)}
            >
            Add to Cart
         </button>
        </div>
      </div>
    </div>
  );
}
