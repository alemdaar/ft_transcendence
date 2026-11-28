import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { studyMockEnabled } from '../study-request/config';
import { studyTestTokenEnabled } from './config';
import { clearStudyTestToken, getStudyTestToken, saveStudyTestToken } from './token';

export default function StudyTestTokenControls() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  if (!studyTestTokenEnabled || studyMockEnabled) return null;

  function apply(event) {
    event.preventDefault();
    try {
      saveStudyTestToken(value);
      window.location.reload();
    } catch (error) {
      setError(error.message);
    }
  }

  function clear() {
    clearStudyTestToken();
    window.location.reload();
  }

  return (
    <form onSubmit={apply} className="space-y-3 rounded-xl border border-success-line bg-selected p-4">
      <p className="text-sm font-semibold text-fg">Study Requests · Local token test</p>
      <p className="text-sm text-muted">
        Connect to the real study request backend using your JWT. This token stays in this browser tab.
      </p>
      {getStudyTestToken() && <p role="status" className="text-sm text-highlight">A test token is saved for this tab.</p>}
      <Input label="Access token" type="password" autoComplete="off" spellCheck={false}
        value={value} onChange={event => { setValue(event.target.value); setError(''); }}
        placeholder="Paste JWT or Bearer token" error={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={!value.trim()}>Use token</Button>
        <Button variant="secondary" onClick={clear}>Remove token</Button>
      </div>
    </form>
  );
}
