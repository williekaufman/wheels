import React from 'react';
import './Toast.css';

const Toast = ({ message, onClose }) => {
  return (
    <div className="error-toast">
      <div className="error-toast-content">
        <span className="error-toast-message">{message}</span>
        <button className="error-toast-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
