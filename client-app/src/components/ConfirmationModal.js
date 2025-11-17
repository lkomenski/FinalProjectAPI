import React from "react";
import "../Styles/ConfirmationModal.css";

export default function ConfirmationModal({
  title,
  message,
  confirmText,
  confirmColor = "red",
  onConfirm,
  onCancel
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-buttons">
          <button className="modal-btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>

          <button
            className="modal-btn confirm-btn"
            style={{ backgroundColor: confirmColor }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
