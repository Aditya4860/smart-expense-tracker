import Modal from '../ui/Modal';

export default function IncomeModal({ isOpen, onClose, title, size = 'lg', children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="income-modal-title" size={size}>
      {children}
    </Modal>
  );
}
