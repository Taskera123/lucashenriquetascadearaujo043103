import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { api } from '../../services/api';

export default function HealthPage() {
  const [status, setStatus] = useState<{ ok: boolean; latency: number; error?: string } | null>(null);

  async function run() {
    const t0 = performance.now();
    try {
      await api.get('/');
      setStatus({ ok: true, latency: Math.round(performance.now() - t0) });
    } catch (e: any) {
      setStatus({ ok: false, latency: Math.round(performance.now() - t0), error: e?.message ?? 'Falha' });
    }
  }

  useEffect(() => { run(); }, []);

  return (
    <div className="p-2">
      <Card title="Health Checks (Front)">
        {status ? (
          status.ok ? (
            <Message severity="success" text={`OK • ~${status.latency}ms`} />
          ) : (
            <Message severity="error" text={`Falha • ${status.error ?? 'erro'} • ~${status.latency}ms`} />
          )
        ) : (
          <Message severity="info" text="Executando..." />
        )}
        <div className="mt-3">
          <Button icon="pi pi-refresh" label="Re-testar" onClick={run} />
        </div>
      </Card>
    </div>
  );
}
