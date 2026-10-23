import Modal from './Modal.jsx';
import { useI18n } from '../i18n/index.jsx';

export default function ConfirmDialog({ open, title, body, confirmLabel, danger = false, onConfirm, onClose }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={title} titleId="confirm-title">
      <p>{body}</p>
      <div className="btn-row">
        <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          {t('ui.cancel')}
        </button>
      </div>
    </Modal>
  );
}
