import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const KEY = 'ui.theme';

function load(): ThemeMode {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(mode: ThemeMode) {
  const baseUrl = (import.meta.env.BASE_URL ?? '/').replace(/\/?$/, '/');
  const themePath = `${baseUrl}themes/${mode === 'dark' ? 'lara-dark-blue' : 'lara-light-blue'}/theme.css`;
  let link = document.getElementById('theme-link') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'theme-link';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = themePath;
  document.documentElement.dataset.theme = mode;
}

const initial = load();
applyTheme(initial);

export const theme$ = new BehaviorSubject<ThemeMode>(initial);

export function setTheme(mode: ThemeMode) {
  theme$.next(mode);
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // ignore
  }
  applyTheme(mode);
}

export function toggleTheme() {
  setTheme(theme$.value === 'dark' ? 'light' : 'dark');
}
