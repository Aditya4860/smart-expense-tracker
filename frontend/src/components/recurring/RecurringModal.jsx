import Modal from '../ui/Modal';

export default function RecurringModal({ isOpen, onClose, title, size = 'lg', children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="recurring-modal-title" size={size}>
      {children}
    </Modal>
  );
}
