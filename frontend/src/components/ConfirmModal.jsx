import React, { useId } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  isDanger = false,
}) {
  if (!isOpen) return null;

  const Icon = isDanger ? AlertTriangle : ShieldCheck;
  const titleId = useId();
  const messageId = useId();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={message ? messageId : undefined}>
      <div className={`modal-content card confirm-modal ${isDanger ? 'confirm-modal-danger' : ''}`}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className={`modal-icon-badge ${isDanger ? 'danger' : 'primary'}`}>
              <Icon size={20} />
            </div>
            <div>
              <h3 id={titleId}>{title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-small" type="button" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p id={messageId} className="modal-message">{message}</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary" type="button">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`btn-action ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
