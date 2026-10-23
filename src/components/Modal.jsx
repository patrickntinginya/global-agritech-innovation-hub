import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { useI18n } from '../i18n/index.jsx';

// Built on the native <dialog> element: it supplies focus trapping, Escape to close and the backdrop.
export default function Modal({ open, onClose, title, titleId, children }) {
  const ref = useRef(null);
  const { t } = useI18n();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal__panel">
        <div className="modal__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('actions.close')}>
            <Icon name="x" />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
