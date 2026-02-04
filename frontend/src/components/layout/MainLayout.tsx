import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SideNav from './SideNav';
import TopBar from './TopBar';
import { auth$ } from '../../state/auth.store';
import { AuthFacade } from '../../facades/AuthFacade';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const nav = useNavigate();
  const [auth, setAuth] = useState(auth$.value);
  const [showRenew, setShowRenew] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [isSmall, setIsSmall] = useState(false);
  const SIDEBAR_W = collapsed ? 72 : 260;
  const thresholdMs = 2 * 60 * 1000;

  useEffect(() => {
    const sub = auth$.subscribe(setAuth);
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!auth.expiresAt) {
      setShowRenew(false);
      setTimeLeftMs(null);
      return;
    }

    const tick = () => {
      const diff = auth.expiresAt ? auth.expiresAt - Date.now() : null;
      if (diff == null) return;
      setTimeLeftMs(diff);
      if (diff <= thresholdMs && diff > 0) {
        setShowRenew(true);
      }
      if (diff <= 0) {
        setShowRenew(true);
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [auth.expiresAt]);

  const timeLeftLabel = useMemo(() => {
    if (timeLeftMs == null) return '';
    const totalSeconds = Math.max(0, Math.floor(timeLeftMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }, [timeLeftMs]);

  async function handleRenew() {
    try {
      await AuthFacade.refresh();
      setShowRenew(false);
    } catch {
      AuthFacade.logout();
      nav('/home');
    }
  }

  function handleLogout() {
    AuthFacade.logout();
    nav('/home');
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {!isSmall ? <SideNav collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} /> : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <TopBar sidebarWidth={SIDEBAR_W} username={auth.username ?? undefined} />
          <main style={{ padding: 16 }}>
            <Outlet />
          </main>
        </div>
      </div>

      <Dialog
        header="Sessão expirando"
        visible={showRenew}
        onHide={() => setShowRenew(false)}
        style={{ width: 'min(420px, 92vw)' }}
        footer={
          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
            <Button label="Sair" text onClick={handleLogout} />
            <Button label="Renovar token" icon="pi pi-refresh" onClick={handleRenew} />
          </div>
        }
      >
        <p style={{ margin: 0 }}>
          Sua sessão está prestes a expirar{timeLeftLabel ? ` (restam ${timeLeftLabel})` : ''}. Deseja renovar o token?
        </p>
      </Dialog>
    </>
  );
}
