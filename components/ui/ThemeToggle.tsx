/**
 * Dark / light switch.
 *
 * The choice is stored in both a cookie and localStorage, and replayed by the
 * pre-paint script in app/layout.tsx before first paint — otherwise the page
 * flashes dark before the saved light theme applies.
 *
 * With no saved choice the attribute is left unset and prefers-color-scheme in
 * styles/tokens.css decides, so a first visit matches the visitor's OS.
 */

'use client';

import {useEffect, useState} from 'react';
import styles from '@/components/motion/MotionToggle.module.css';

type Theme = 'dark' | 'light';

function readTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: light)');
    const sync = () => setTheme(readTheme());
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
      document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* The choice still applies for this page view. */
    }
  };

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      className={`${styles.toggle} focus-ring`}
      aria-pressed={isLight}
      aria-label={isLight ? 'Light theme. Switch to dark.' : 'Dark theme. Switch to light.'}
      onClick={() => choose(isLight ? 'dark' : 'light')}
    >
      <span aria-hidden="true">{isLight ? '☀' : '☾'}</span>
      {isLight ? 'Light' : 'Dark'}
      <span className={styles.tip} aria-hidden="true">
        {isLight ? 'Click to switch to dark' : 'Click to switch to light'}
      </span>
    </button>
  );
}
