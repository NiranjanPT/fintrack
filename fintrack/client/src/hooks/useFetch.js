// Experiment 9 - Reusable data-fetching hook with loading and error states
import { useCallback, useEffect, useState } from 'react';

/**
 * Calls an async function and tracks { data, loading, error }.
 * The request re-runs whenever a value in `deps` changes, or when refetch() is called.
 */
export default function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let ignore = false; // avoids setting state from an outdated request

    setLoading(true);
    setError('');

    fetchFn()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadIndex]);

  const refetch = useCallback(() => setReloadIndex((i) => i + 1), []);

  return { data, loading, error, refetch, setData };
}
