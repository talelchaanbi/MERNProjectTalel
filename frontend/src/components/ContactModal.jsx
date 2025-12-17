import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Phone, CheckCircle } from 'lucide-react';
import { sendMessage } from '../api/messages';
import ConfirmModal from './ConfirmModal';

export default function ContactModal({ open, onClose }) {
  useEffect(() => {
    console.log('ContactModal: mount status=', open);
    return () => console.log('ContactModal: unmount');
  }, [open]);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', organization: '', message: '' });
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [successPopup, setSuccessPopup] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);

  // Auto-close the confirmation popup after 3s and close the contact modal
  useEffect(() => {
    if (!successPopup) return undefined;
    const t = setTimeout(() => {
      setSuccessPopup(false);
      setSuccess(null);
      onClose(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [successPopup, onClose]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendMessage({ ...form, priority });
      const msg = 'Message envoyé. Merci, nous vous contacterons bientôt.';
      setSuccess(msg);
      setSuccessPopup(true);
      setForm({ firstName: '', lastName: '', email: '', phone: '', organization: '', message: '' });
      setPriority('normal');
      // notify other parts of app (e.g., navbar) that messages changed
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('messages:updated'));
    } catch (err) {
      setErrors(err?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  // Auto-close the confirmation popup after 3s and close the contact modal

  const modal = (
    <div className="modal-overlay debug-modal" role="dialog" aria-modal="true">
      <div className="modal-content card modal-compact debug">
        <div className="modal-header contact-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge primary"><Mail size={20} /></div>
            <div>
              <h2>Contact / Support</h2>
              <div className="modal-sub">Posez votre question — l'administrateur vous répondra rapidement.</div>
            </div>
          </div>
          <button className="btn-icon-small" onClick={() => onClose(false)} aria-label="Fermer"><X size={18} /></button>
        </div>
        <form className="form modal-body" onSubmit={handleSubmit}>
          {errors && <div className="error-message">{errors}</div>}
          {success && <div className="success-message">{success}</div>}
          <div className="form-grid">
            <label className="form-label">
              Prénom
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </label>
            <label className="form-label">
              Nom
              <input name="lastName" value={form.lastName} onChange={handleChange} />
            </label>
            <label className="form-label">
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label className="form-label">
              Téléphone
              <input name="phone" value={form.phone} onChange={handleChange} />
            </label>
            <label className="form-label">
              Priorité
              <select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="normal">Normale</option>
                <option value="urgent">Urgente</option>
              </select>
            </label>
            <label className="form-label span-2">
              Organisation
              <input name="organization" value={form.organization} onChange={handleChange} />
            </label>
            <label className="form-label span-2 message-field">
              Message
              <textarea name="message" rows={6} maxLength={1000} value={form.message} onChange={handleChange} required />
              <div className="textarea-meta">
                <span className="char-count">{form.message.length}/1000</span>
                <small className="hint">Soyez précis et concis — décrivez le problème et le résultat attendu.</small>
              </div>
            </label>
          </div>
          <div className="modal-actions modal-fixed-actions">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Envoi…' : 'Envoyer'}</button>
            <button type="button" className="btn-secondary" onClick={() => onClose(false)}>Annuler</button>
          </div>
        </form>
        <div className={`success-banner ${successPopup ? 'show' : ''}`} role="status" aria-live="polite">
          <div className="success-icon"><CheckCircle size={20} /></div>
          <div>
            <strong>{success || 'Message envoyé'}</strong>
            <div className="small">Merci — nous vous répondrons bientôt.</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modal, document.body);
  }
  return modal;
}
