import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import StudyModeSelector from './StudyModeSelector';
import { editRequest } from '../../services/requestActivity';

export default function EditRequestModal({ request, onClose, onSaved }) {
  const [topic, setTopic] = useState(request.topic);
  const [description, setDescription] = useState(request.description);
  const [mode, setMode] = useState(request.mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    try { await editRequest(request.id, { topic, description, mode }); onSaved(); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }
  return <Modal open busy={loading} onClose={onClose} title="Edit study request">
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <fieldset disabled={loading} className="space-y-4">
        <Input label="Topic" value={topic} onChange={event => setTopic(event.target.value)} minLength={5} maxLength={100} required />
        <StudyModeSelector mode={mode} onChange={setMode} />
        <label className="block space-y-2 text-sm font-medium"><span>Description</span><textarea className="input min-h-32" value={description} onChange={event => setDescription(event.target.value)} minLength={10} maxLength={255} required /></label>
      </fieldset>
      <div className="flex justify-end gap-3"><Button variant="secondary" disabled={loading} onClick={onClose}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</Button></div>
    </form>
  </Modal>;
}
