import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { deleteRequest } from '../../services/requestActivity';

export default function DeleteRequestModal({ request, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    if (loading) return;
    setLoading(true); setError('');
    try { await deleteRequest(request.id); onDeleted(); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }
  return <Modal open busy={loading} onClose={onClose} title="Delete study request?">
    <p className="mb-5 break-words text-sm text-muted">Delete “{request.topic}”? This cannot be undone.</p>
    {error && <p role="alert" className="mb-4 text-sm text-danger">{error}</p>}
    <div className="flex justify-end gap-3"><Button variant="secondary" disabled={loading} onClick={onClose}>Cancel</Button><Button variant="danger" disabled={loading} onClick={remove}>{loading ? 'Deleting…' : 'Delete request'}</Button></div>
  </Modal>;
}
