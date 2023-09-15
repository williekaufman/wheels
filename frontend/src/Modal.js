import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, onSubmit }) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <label htmlFor="gameId">Enter Game ID:</label>
        <input type="text" id="gameId" placeholder="Enter Game ID" />
        <button onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
}