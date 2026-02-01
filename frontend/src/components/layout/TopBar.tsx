import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { theme$, toggleTheme } from '../../state/theme.store';

export default function TopBar({ sidebarWidth, username }: { sidebarWidth: number; username?: string | null }) {
  const nav = useNavigate();
  const [isSmall, setIsSmall] = useState(false);
  const [theme, setTheme] = useState(theme$.value);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 960px)');
    const update = () => setIsSmall(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const sub = theme$.subscribe(setTheme);
    return () => sub.unsubscribe();
  }, []);

  const welcome = `PROJETO ARISTAS & ALBUNS - BEM VINDO ${username ?? 'USUÁRIO'}`;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--surface-0)', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '10px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ fontWeight: 700 }}>{isSmall ? 'Painel' : welcome}</div>
        {isSmall ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon="pi pi-users" text aria-label="Artistas" onClick={() => nav('/admin/artistas')} />
            <Button icon="pi pi-images" text aria-label="Álbuns" onClick={() => nav('/admin/albums')} />
            <Button icon="pi pi-sitemap" text aria-label="Bandas" onClick={() => nav('/admin/bandas')} />
            <Button icon="pi pi-heart" text aria-label="Health" onClick={() => nav('/admin/health')} />
            <Button icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'} text aria-label="Alternar tema" onClick={toggleTheme} />
          </div>
        ) : null}
      </div>
    </header>
  );
}
