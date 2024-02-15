import Modal from "../utils/Modal";
import QueryBuilder from "./QueryBuilder";

export default function QueryBuilderModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="x-large">
      <QueryBuilder />
    </Modal>
  )
}