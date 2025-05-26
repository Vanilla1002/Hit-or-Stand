import React from 'react';
import { FaTrash } from 'react-icons/fa';
import './trashModal.css';

type Props = {
  isOpen: boolean;
  trash: string[];
  activeSuit: string;
  onAdd: (rank: string) => void;
  onRemove: (idx: number) => void;
  onClose: () => void;
};

export function TrashModal({ isOpen, trash, activeSuit, onAdd, onRemove, onClose }: Props) {
  if (!isOpen) return null;
  
  const RANKS = [
    'A','2','3','4','5','6','7','8','9','10','J','Q','K'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal trash-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} aria-label="Close Trash">
          ×
        </button>
        <h3 className="modal-title">Seen Cards</h3>
        <div className="trash-list">
          {trash.map((card, idx) => (
            <div key={idx} className="trash-item">
              <img
                src={`/cards/${activeSuit}_${card}.png`}
                alt={card}
                className="trash-card"
              />
              <button
                className="remove-card-btn"
                onClick={() => onRemove(idx)}
                aria-label="Remove card"
              >
                ×
              </button>
            </div>
          ))}
          <div className="add-trash-slot" onClick={() => { /* open rank picker here or pass rank */ }}>
            +
          </div>
        </div>
        <hr />
        <h4 className="modal-subtitle">Add a Card</h4>
        <div className="picker-grid">
          {RANKS.map(rank => (
            <img
              key={rank}
              src={`/cards/${activeSuit}_${rank}.png`}
              alt={rank}
              className="card-image picker-card"
              onClick={() => onAdd(rank)}
            />
          ))}
          <div className="picker-close-slot" onClick={onClose}>×</div>
        </div>
      </div>
    </div>
  );
}
