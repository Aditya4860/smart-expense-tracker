import Modal from '../ui/Modal';

export default function BudgetModal({ isOpen, onClose, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="budget-modal-title">
      {children}
    </Modal>
  );
}
