import { useEffect, useState } from 'react';
import { getSession } from '../services/requestActivity';

export default function useStudySession(id) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ data: null, loading: true, error: '' });
      try {
        const data = await getSession(id, controller.signal);
        if (!controller.signal.aborted) setState({ data, loading: false, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setState({ data: null, loading: false, error: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, [id, revision]);
  return { ...state, reload: () => setRevision(value => value + 1) };
}
