import Modal from '../ui/Modal';

export default function GoalModal({ isOpen, onClose, title, children }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} titleId="goal-modal-title">
      {children}
    </Modal>
  );
}
