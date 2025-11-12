import React from "react";

export default function ErrorMessage({ message }) {
  return (
    <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
      {message || "Something went wrong. Please try again."}
    </div>
  );
}
