import React from "react";
import "../Styles/modal.css";

export default function InvoiceDetailModal({ invoice, onClose }) {
  if (!invoice) return null;

  // Calculate subtotal from line items if available
  const calculateSubtotal = () => {
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      return invoice.lineItems.reduce((sum, item) => sum + (item.invoiceLineItemAmount || 0), 0);
    }
    return invoice.invoiceTotal || 0;
  };

  const subtotal = calculateSubtotal();
  const amountDue = (invoice.invoiceTotal || 0) - (invoice.paymentTotal || 0) - (invoice.creditTotal || 0);

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
                <label>Invoice Number:</label>
                <span>#{invoice.invoiceNumber || invoice.invoiceID}</span>
              </div>
              <div className="invoice-field">
                <label>Status:</label>
                <span className={amountDue <= 0 ? "status-paid" : "status-unpaid"}>
                  {amountDue <= 0 ? "Paid" : "Unpaid"}
                </span>
              </div>
              <div className="invoice-field">
                <label>Invoice Date:</label>
                <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
              </div>
              <div className="invoice-field">
                <label>Due Date:</label>
                <span>{invoice.invoiceDueDate ? new Date(invoice.invoiceDueDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              {invoice.termsDescription && (
                <div className="invoice-field">
                  <label>Payment Terms:</label>
                  <span>{invoice.termsDescription}</span>
                </div>
              )}
            </div>

            {/* Line Items in Invoice Information Section */}
            {invoice.lineItems && invoice.lineItems.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '0.95rem', color: '#374151' }}>Invoice Items:</h4>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Account</th>
                      <th>Description</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.invoiceSequence || index + 1}</td>
                        <td>
                          {item.accountNo || 'N/A'}
                          {item.accountDescription && (
                            <><br /><span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.accountDescription}</span></>
                          )}
                        </td>
                        <td>{item.invoiceLineItemDescription || 'N/A'}</td>
                        <td className="text-right">${item.invoiceLineItemAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Vendor Info */}
          <div className="invoice-section">
            <h3>Vendor Information</h3>
            <div className="invoice-grid">
              <div className="invoice-field">
                <label>Vendor Name:</label>
                <span>{invoice.vendorName || 'N/A'}</span>
              </div>
              <div className="invoice-field">
                <label>Contact Person:</label>
                <span>
                  {invoice.vendorContactFName && invoice.vendorContactLName
                    ? `${invoice.vendorContactFName} ${invoice.vendorContactLName}`
                    : 'N/A'}
                </span>
              </div>
              {invoice.vendorPhone && (
                <div className="invoice-field">
                  <label>Phone:</label>
                  <span>{invoice.vendorPhone}</span>
                </div>
              )}
              {invoice.vendorEmail && (
                <div className="invoice-field">
                  <label>Email:</label>
                  <span>{invoice.vendorEmail}</span>
                </div>
              )}
              {(invoice.vendorAddress1 || invoice.vendorCity) && (
                <div className="invoice-field" style={{ gridColumn: 'span 2' }}>
                  <label>Address:</label>
                  <span>
                    {invoice.vendorAddress1 && <>{invoice.vendorAddress1}<br /></>}
                    {invoice.vendorAddress2 && <>{invoice.vendorAddress2}<br /></>}
                    {invoice.vendorCity && invoice.vendorState && invoice.vendorZipCode && (
                      <>{invoice.vendorCity}, {invoice.vendorState} {invoice.vendorZipCode}</>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="invoice-section">
            <h3>Financial Summary</h3>
            <div className="invoice-totals">
              <div className="invoice-total-row">
                <label>Subtotal:</label>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {invoice.paymentTotal > 0 && (
                <div className="invoice-total-row">
                  <label>Payments Applied:</label>
                  <span>-${invoice.paymentTotal.toFixed(2)}</span>
                </div>
              )}
              {invoice.creditTotal > 0 && (
                <div className="invoice-total-row">
                  <label>Credits Applied:</label>
                  <span>-${invoice.creditTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="invoice-total-row total">
                <label>Total Amount:</label>
                <span>${invoice.invoiceTotal?.toFixed(2)}</span>
              </div>
              {amountDue > 0 && (
                <div className="invoice-total-row outstanding">
                  <label>Amount Due:</label>
                  <span>${amountDue.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="dashboard-btn dashboard-btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
