import { useEffect, useState } from 'react';
import { getStudyRequests } from '../services/studyRequests';

export default function useStudyRequests() {
  const [requests, setRequests] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeed() {
      setFeedLoading(true);
      setFeedError("");
      try {
        const posts = await getStudyRequests(controller.signal);
        if (!controller.signal.aborted) setRequests(posts);
      } catch (err) {
        if (!controller.signal.aborted) setFeedError(err instanceof Error ? err.message : "Could not load study requests.");
      } finally {
        if (!controller.signal.aborted) setFeedLoading(false);
      }
    }
    loadFeed();
    return () => controller.abort();
  }, [refresh]);


  function reload() {
    setRefresh(value => value + 1);
  }
  return { requests, loading: feedLoading, error: feedError, reload };
}
