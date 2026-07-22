import Modal from '../ui/Modal';

export default function IncomeModal({ isOpen, onClose, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="income-modal-title">
      {children}
    </Modal>
  );
}
