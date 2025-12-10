import { useEffect, useState } from 'react';

export function useAnnouncements(baseURL:string, tenantId:string, audience?:'consultor'|'marketplace'|'lojista') {
  const [data,setData] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    if (!baseURL || !tenantId) {
        setLoading(false);
        return;
    }
    const q = new URLSearchParams({ tenantId, ...(audience?{audience}:{}), limit:'50' }).toString();
    fetch(`${baseURL}/v1/communications/announcements?${q}`, { credentials:'include' })
      .then(r=>r.json()).then(j=>setData(j.data||[])).finally(()=>setLoading(false));
  }, [baseURL,tenantId,audience]);

  return { data, loading };
}
