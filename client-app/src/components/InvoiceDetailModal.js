import React from "react";
import "../Styles/modal.css";

export default function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invoice Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Invoice Header */}
          <div className="invoice-section">
            <h3>Invoice Information</h3>
            <div className="invoice-grid">
              <div className="invoice-field">
                <label>Invoice ID:</label>
                <span>#{invoice.invoiceID}</span>
              </div>
              <div className="invoice-field">
                <label>Status:</label>
                <span className={invoice.isPaid || invoice.amountDue === 0 ? "status-paid" : "status-unpaid"}>
                  {invoice.isPaid || invoice.amountDue === 0 ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div className="invoice-field">
                <label>Invoice Date:</label>
                <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
              </div>
              <div className="invoice-field">
                <label>Due Date:</label>
                <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Customer & Vendor Info */}
          <div className="invoice-section">
            <h3>Parties</h3>
            <div className="invoice-grid">
              <div className="invoice-field">
                <label>Customer:</label>
                <span>{invoice.customerName || 'N/A'}</span>
              </div>
              <div className="invoice-field">
                <label>Vendor:</label>
                <span>{invoice.vendorName || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div className="invoice-section">
              <h3>Line Items</h3>
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName || item.description || 'Product'}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice?.toFixed(2)}</td>
                      <td>${(item.quantity * item.unitPrice)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Financial Summary */}
          <div className="invoice-section">
            <h3>Financial Summary</h3>
            <div className="invoice-totals">
              <div className="invoice-total-row">
                <label>Subtotal:</label>
                <span>${(invoice.totalAmount - (invoice.taxAmount || 0))?.toFixed(2)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="invoice-total-row">
                  <label>Tax:</label>
                  <span>${invoice.taxAmount?.toFixed(2)}</span>
                </div>
              )}
              <div className="invoice-total-row total">
                <label>Total Amount:</label>
                <span>${invoice.totalAmount?.toFixed(2)}</span>
              </div>
              {invoice.amountDue > 0 && (
                <div className="invoice-total-row outstanding">
                  <label>Amount Due:</label>
                  <span>${invoice.amountDue?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="invoice-section">
              <h3>Notes</h3>
              <p className="invoice-notes">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="dashboard-btn dashboard-btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
