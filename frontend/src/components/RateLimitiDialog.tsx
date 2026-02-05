import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { clearRateLimit, rateLimit$ } from '../state/rateLimit.store';

export default function RateLimitDialog() {
  const [rateLimit, setRateLimit] = useState(rateLimit$.value);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  useEffect(() => {
    const sub = rateLimit$.subscribe(setRateLimit);
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!rateLimit.active || !rateLimit.resetAt) {
      setTimeLeftMs(null);
      return;
    }

    const tick = () => {
      const diff = rateLimit.resetAt ? rateLimit.resetAt - Date.now() : null;
      if (diff == null) return;
      if (diff <= 0) {
        clearRateLimit();
        setTimeLeftMs(0);
        return;
      }
      setTimeLeftMs(diff);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [rateLimit.active, rateLimit.resetAt]);

  const timeLeftLabel = useMemo(() => {
    if (timeLeftMs == null) return '';
    const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }, [timeLeftMs]);

  const detail = rateLimit.resetAt
    ? `Tempo restante para novas requisições: ${timeLeftLabel}.`
    : 'Aguarde alguns instantes e tente novamente.';

  return (
    <Dialog
      header="Limite de requisições atingido"
      visible={rateLimit.active}
      onHide={clearRateLimit}
      style={{ width: 'min(460px, 92vw)' }}
      footer={
        <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
          <Button label="Entendi" onClick={clearRateLimit} />
        </div>
      }
    >
      <p style={{ margin: '0 0 8px' }}>{rateLimit.message}</p>
      <p style={{ margin: 0 }}>{detail}</p>
    </Dialog>
  );
}
