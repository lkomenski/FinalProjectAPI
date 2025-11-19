import React, { useState } from "react";
import "../Styles/modal.css";

export default function TokenModal({ tokenData, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tokenData.registrationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const formatExpiry = (expiryDate) => {
    const date = new Date(expiryDate);
    return date.toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2>Registration Token Generated</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Security Warning */}
          <div 
            style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}
          >
            <strong style={{ color: '#92400e', fontSize: '1.1rem' }}>⚠️ Important Security Information</strong>
            <ul style={{ marginTop: '10px', color: '#78350f', lineHeight: '1.6' }}>
              <li>This token will <strong>expire in {tokenData.hoursUntilExpiry} hours</strong></li>
              <li>The token can only be used <strong>once</strong> to create an account</li>
              <li>Do NOT share this token publicly or store it in unsecured locations</li>
              <li>Send this token securely to the vendor via encrypted email</li>
              <li>The token will be automatically invalidated after use or expiration</li>
            </ul>
          </div>

          {/* Vendor Information */}
          <div className="modal-section">
            <h3>Vendor Information</h3>
            <div className="info-grid">
              <div>
                <label>Vendor Name</label>
                <p>{tokenData.vendorName}</p>
              </div>
              <div>
                <label>Contact Person</label>
                <p>{tokenData.firstName} {tokenData.lastName}</p>
              </div>
              <div>
                <label>Email</label>
                <p>{tokenData.vendorEmail}</p>
              </div>
              <div>
                <label>Vendor ID</label>
                <p>{tokenData.vendorID}</p>
              </div>
            </div>
          </div>

          {/* Token Display */}
          <div className="modal-section">
            <h3>Registration Token</h3>
            <div 
              style={{
                backgroundColor: '#f3f4f6',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                marginBottom: '10px'
              }}
            >
              {tokenData.registrationToken}
            </div>
            <button
              className="dashboard-btn dashboard-btn-info"
              onClick={copyToClipboard}
              style={{ width: '100%' }}
            >
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Token to Clipboard'}
            </button>
          </div>

          {/* Expiration Info */}
          <div className="modal-section">
            <h3>Token Expiration</h3>
            <div 
              style={{
                backgroundColor: '#fee2e2',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #fca5a5'
              }}
            >
              <p style={{ margin: 0, color: '#7f1d1d' }}>
                <strong>Expires on:</strong> {formatExpiry(tokenData.tokenExpiry)}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#991b1b' }}>
                <strong>Time remaining:</strong> {tokenData.hoursUntilExpiry} hours
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="modal-section">
            <h3>Next Steps</h3>
            <ol style={{ lineHeight: '1.8', color: '#374151' }}>
              <li>Copy the token using the button above</li>
              <li>Send the token securely to the vendor via email</li>
              <li>Instruct the vendor to visit the registration page</li>
              <li>The vendor will use this token to create their account</li>
              <li>Once used, the token will be automatically invalidated</li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="dashboard-btn"
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied!' : 'Copy Token'}
          </button>
          <button 
            className="dashboard-btn dashboard-btn-secondary" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
