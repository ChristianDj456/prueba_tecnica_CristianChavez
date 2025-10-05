import { useEffect, useState } from 'react'
import { api, authHeaders } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export type Catalog = { id: string; name: string };

export function useCatalogs() {
  const { token } = useAuth();
  const [arl, setArl] = useState<Catalog[]>([]);
  const [eps, setEps] = useState<Catalog[]>([]);
  const [pf, setPf] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const [a, e, p] = await Promise.all([
          api.get<Catalog[]>('/catalogs/arl', { headers: authHeaders(token) }),
          api.get<Catalog[]>('/catalogs/eps', { headers: authHeaders(token) }),
          api.get<Catalog[]>('/catalogs/pension-funds', { headers: authHeaders(token) }),
        ]);
        setArl(a.data); setEps(e.data); setPf(p.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Error cargando catálogos');
      } finally { setLoading(false); }
    }
    if (token) load();
  }, [token]);

  return { arl, eps, pf, loading, error }
}
