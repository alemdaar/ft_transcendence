import { useEffect, useState } from 'react';
import { getActivity } from '../services/requestActivity';

export default function useRequestActivity(scope) {
  const [state, setState] = useState({ requests: [], loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ requests: [], loading: true, error: '' });
      try {
        const requests = await getActivity(scope, controller.signal);
        if (!controller.signal.aborted) setState({ requests, loading: false, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setState({ requests: [], loading: false, error: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, [scope, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
