import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { AuthFacade } from '../../facades/AuthFacade';
import { theme$, toggleTheme } from '../../state/theme.store';

type Props = { collapsed: boolean; onToggle: () => void; };
type Item = { to: string; label: string; icon: string; enabled?: boolean; };

const items: Item[] = [
  { to: '/admin/artistas', label: 'Artistas', icon: 'pi pi-users' },
  { to: '/admin/albums', label: 'Álbuns', icon: 'pi pi-images' },
  { to: '/admin/bandas', label: 'Bandas', icon: 'pi pi-sitemap' },
  { to: '/admin/health', label: 'Health', icon: 'pi pi-heart' }
];

export default function SideNav({ collapsed, onToggle }: Props) {
  const nav = useNavigate();
  const [theme, setTheme] = useState(theme$.value);
  const width = collapsed ? 80 : 260;

  useEffect(() => {
    const sub = theme$.subscribe(setTheme);
    return () => sub.unsubscribe();
  }, []);

  return (
    <aside style={{ width, transition: 'width 180ms ease', borderRight: '1px solid rgba(0,0,0,0.08)', padding: 12,
      display: 'flex', flexDirection: 'column', gap: 12, position: 'sticky', top: 0, height: '100vh', background: 'var(--surface-0)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          { !collapsed && <i className="pi pi-box" style={{ fontSize: 18 }} />}
          {!collapsed && <div style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>Artista/Album</div>}
        </div>
        <Button icon={collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'} rounded text aria-label="Recolher menu" onClick={onToggle} />
      </div>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {items.filter((i) => i.enabled !== false).map((it) => (
          <NavItem key={it.to} item={it} collapsed={collapsed} />
        ))}
      </nav>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Tooltip target=".sidenav-theme" content={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} position="right" disabled={!collapsed} />
        <Button
          className="sidenav-theme"
          icon={theme === 'dark' ? 'pi pi-sun' : 'pi pi-moon'}
          label={collapsed ? '' : theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          text
          onClick={toggleTheme}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        />
        <Tooltip target=".sidenav-logout" content="Sair" position="right" disabled={!collapsed} />
        <Button
          className="sidenav-logout"
          icon="pi pi-sign-out"
          label={collapsed ? '' : 'Sair'}
          severity="danger"
          text
          onClick={() => { AuthFacade.logout(); nav('/'); }}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        />
      </div>
    </aside>
  );
}

function NavItem({ item, collapsed }: { item: Item; collapsed: boolean }) {
  return (
    <>
      <Tooltip target={`.nav-${cssKey(item.to)}`} content={item.label} position="right" disabled={!collapsed} />
      <NavLink
        to={item.to}
        className={({ isActive }) => [`nav-${cssKey(item.to)}`, isActive ? 'active' : ''].join(' ')}
        style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 10, textDecoration: 'none',
          color: 'inherit', background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent', fontWeight: isActive ? 700 : 500, overflow: 'hidden'
        })}
      >
        <i className={item.icon} style={{ fontSize: 16, width: 18, textAlign: 'center' }} />
        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
      </NavLink>
    </>
  );
}

function cssKey(path: string) { return path.replace(/[^\w]/g, '_'); }
