import { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { emitUpdate, updates$ } from '../state/wsUpdates.store';
import { createStompClient } from '../services/WebSocket';

export default function RealtimeUpdatesListener() {
  const toastRef = useRef<Toast>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

  useEffect(() => {
    const { client } = createStompClient({
      baseUrl,
      onError: () => {}
    });

    let subscription: { unsubscribe: () => void } | null = null;

    client.onConnect = () => {
      subscription = client.subscribe('/topic/updates', (msg) => {
        try {
          const payload = JSON.parse(msg.body);
          if (payload?.entity) {
            emitUpdate({
              entity: payload.entity,
              action: payload.action ?? 'updated',
              id: payload.id ?? null
            });
          }
        } catch {
          // ignore malformed payloads
        }
      });
    };

    client.activate();

    return () => {
      subscription?.unsubscribe();
      client.deactivate();
    };
  }, [baseUrl]);

  useEffect(() => {
    const sub = updates$.subscribe((event) => {
      if (event.action !== 'created') return;
      let label = '';
      if (event.entity === 'album') label = 'Álbum';
      if (event.entity === 'artista') label = 'Artista';
      if (event.entity === 'banda') label = 'Banda';
      if (!label) return;
      toastRef.current?.show({
        severity: 'success',
        summary: `${label} adicionada`,
        detail: 'Novo cadastro recebido via atualização em tempo real.',
        life: 5000
      });
    });
    return () => sub.unsubscribe();
  }, []);

  return <Toast ref={toastRef} position="top-right" />;
}
