import { useEffect, useState } from "react";
import { getGroup } from "../services/groups";

export default function useGroupDetails(id) {
  const [state, setState] = useState({ group: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ group: null, loading: true, error: "" });
      try {
        const group = await getGroup(id, controller.signal);
        if (!controller.signal.aborted)
          setState({ group, loading: false, error: "" });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({ group: null, loading: false, error: error.message });
      }
    }
    load();
    return () => controller.abort();
  }, [id, revision]);
  return { ...state, retry: () => setRevision((value) => value + 1) };
}
