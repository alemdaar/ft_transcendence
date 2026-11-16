import Modal from '../ui/Modal';
import SessionRequestInfo from '../sessions/SessionRequestInfo';

export default function RequestDetailsModal({ request, onClose }) {
  return <Modal open onClose={onClose} title="Study request details">
    <SessionRequestInfo request={request} />
  </Modal>;
}
