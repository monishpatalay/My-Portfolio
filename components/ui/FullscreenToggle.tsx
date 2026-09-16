/**
 * Always-available fullscreen switch.
 *
 * FullscreenNotice offers fullscreen once per page load and then stops, so that
 * pressing Escape is respected rather than fought. That leaves no way back in
 * without a reload — this is it. Because the click is a real user gesture, the
 * browser grants fullscreen here every time, unlike an automatic attempt.
 *
 * Hidden where the API does not exist at all (notably iOS Safari outside video)
 * rather than showing a control that cannot work.
 */

'use client';

import {useEffect, useState} from 'react';
import styles from '@/components/motion/MotionToggle.module.css';

export default function FullscreenToggle() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!document.documentElement.requestFullscreen) return;
    const sync = () => setActive(!!document.fullscreenElement);
    queueMicrotask(() => {
      setSupported(true);
      sync();
    });
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen({navigationUI: 'hide'}).catch(() => {});
  };

  return (
    <button
      type="button"
      className={`${styles.toggle} focus-ring`}
      aria-pressed={active}
      aria-label={active ? 'Exit full screen' : 'Enter full screen'}
      onClick={toggle}
    >
      <span aria-hidden="true">{active ? '⤡' : '⛶'}</span>
      <span className={styles.tip} aria-hidden="true">
        {active ? 'Click to exit full screen' : 'Click for full screen'}
      </span>
    </button>
  );
}
