import Modal from './Modal.jsx';
import PreviewForm from './PreviewForm.jsx';

export default function PreviewFormModal({ open, onClose, title, titleId, ...formProps }) {
  return (
    <Modal open={open} onClose={onClose} title={title} titleId={titleId}>
      <PreviewForm {...formProps} onCancel={onClose} />
    </Modal>
  );
}
