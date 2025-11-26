import React, { useState } from "react";
import "../../Styles/modal.css";

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

  const isExistingToken = tokenData.status === 'ExistingToken';
  const hasToken = tokenData.registrationToken != null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <h2>{isExistingToken ? 'Active Token Exists' : 'Registration Token Generated'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div 
            style={{
              backgroundColor: isExistingToken ? '#fef2f2' : '#fef3c7',
              border: `2px solid ${isExistingToken ? '#ef4444' : '#f59e0b'}`,
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}
          >
            <strong style={{ color: isExistingToken ? '#991b1b' : '#92400e', fontSize: '1.1rem' }}>
              ⚠️ {isExistingToken ? 'Active Token Already Exists' : 'Important Security Information'}
            </strong>
            <ul style={{ marginTop: '10px', color: isExistingToken ? '#7f1d1d' : '#78350f', lineHeight: '1.6' }}>
              {isExistingToken ? (
                <>
                  <li>This vendor already has an <strong>active registration token</strong></li>
                  <li>The existing token will <strong>expire in {tokenData.hoursUntilExpiry} hours</strong></li>
                  <li><strong>For security purposes, the token cannot be retrieved again</strong></li>
                  <li>The token was only shown once when it was first generated</li>
                  <li>If the vendor lost the token, you must wait for it to expire before generating a new one</li>
                  <li>Expiration date: {formatExpiry(tokenData.tokenExpiry)}</li>
                </>
              ) : (
                <>
                  <li><strong>IMPORTANT: This token will only be shown once!</strong></li>
                  <li>Copy the token now - you will not be able to retrieve it again</li>
                  <li>This token will <strong>expire in {tokenData.hoursUntilExpiry} hours</strong></li>
                  <li>The token can only be used <strong>once</strong> to create an account</li>
                  <li>Do NOT share this token publicly or store it in unsecured locations</li>
                  <li>Send this token securely to the vendor via encrypted email</li>
                  <li>The token will be automatically invalidated after use or expiration</li>
                </>
              )}
            </ul>
          </div>

          <div className="modal-section">
            <h3>Vendor Information</h3>
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '4px'
                }}>Business Name</label>
                <p style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600', 
                  color: '#111827',
                  margin: 0
                }}>{tokenData.vendorName}</p>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '4px'
                }}>Contact Person</label>
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#374151',
                  margin: 0
                }}>{tokenData.firstName} {tokenData.lastName}</p>
              </div>
              
              <div>
                <label style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '4px'
                }}>Email Address</label>
                <p style={{ 
                  fontSize: '0.95rem', 
                  color: '#374151',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>{tokenData.vendorEmail}</p>
              </div>
            </div>
          </div>

          {hasToken && (
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
                {copied ? 'Copied to Clipboard!' : 'Copy Token to Clipboard'}
              </button>
            </div>
          )}

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

          {hasToken && (
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
          )}

          {!hasToken && (
            <div className="modal-section">
              <h3>What to Do</h3>
              <ol style={{ lineHeight: '1.8', color: '#374151' }}>
                <li>Wait for the existing token to expire ({tokenData.hoursUntilExpiry} hours remaining)</li>
                <li>If the vendor lost the token, they must wait for expiration</li>
                <li>After expiration, you can generate a new token</li>
                <li>Consider contacting the vendor to confirm they received the original token</li>
              </ol>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {hasToken && (
            <button 
              className="dashboard-btn"
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy Token'}
            </button>
          )}
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
