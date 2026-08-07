import { useState, useEffect, useRef, useCallback } from 'react';

export default function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store the latest fetchFn in a ref to avoid infinite re-render loops from inline arrow functions
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof fetchFnRef.current === 'function') {
        const result = await fetchFnRef.current();
        setData(result);
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to connect to backend server';
      setError(errMsg);
      console.error('API Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    refetch();
    return () => {
      isMounted = false;
    };
  }, [refetch, ...deps]);

  return { data, loading, error, refetch };
}
