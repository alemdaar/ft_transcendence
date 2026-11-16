import { useState } from 'react';
import { Eye, Hand } from 'lucide-react';
import Button from '../ui/Button';
import { mockEnabled } from '../../mocks/config';
import { claimDemoRequest } from '../../services/studyRequests';

export default function LiveRequestActions({ request, onDetails, onClaimed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function claim() {
    if (loading) return;
    setLoading(true); setError('');
    try { await claimDemoRequest(request.id); onClaimed(); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }
  return <div className="mt-5 space-y-3">
    {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    <div className="grid grid-cols-2 gap-3">
      <Button variant="ghost" onClick={() => onDetails(request)}><Eye size={16} />Details</Button>
      <Button disabled={loading || !mockEnabled || request.status !== 'open'} onClick={claim}
        title={!mockEnabled ? 'Claim endpoint is not configured yet' : undefined}>
        <Hand size={16} />{loading ? 'Claiming…' : 'Claim'}
      </Button>
    </div>
  </div>;
}
