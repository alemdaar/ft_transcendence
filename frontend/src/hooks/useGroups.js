import { useEffect, useState } from "react";
import { getGroups } from "../services/groups";

export default function useGroups({ scope, page, type, search, sort }) {
  const [result, setResult] = useState({
    groups: [],
    pagination: null,
    loading: true,
    error: "",
  });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setResult({ groups: [], pagination: null, loading: true, error: "" });
      try {
        const data = await getGroups(
          { scope, page, type, search, sort },
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setResult({
            groups: data.data,
            pagination: data.pagination,
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({
            groups: [],
            pagination: null,
            loading: false,
            error: error.message || "Could not load groups.",
          });
        }
      }
    }
    const timer = setTimeout(load, scope === "discover" && search ? 300 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [scope, page, type, search, sort, revision]);

  function reload() {
    setRevision((value) => value + 1);
  }
  return { ...result, reload };
}
