import Modal from '../ui/Modal';

export default function BudgetModal({ isOpen, onClose, title, size = 'md', children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="budget-modal-title" size={size}>
      {children}
    </Modal>
  );
}
