import Modal from '../ui/Modal';

export default function ExpenseModal({ isOpen, onClose, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="expense-modal-title">
      {children}
    </Modal>
  );
}
