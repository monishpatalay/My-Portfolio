/**
 * FullscreenNotice — drives the page into fullscreen and tells the visitor how
 * to leave it.
 *
 * The Fullscreen API requires transient user activation. A request on mount is
 * rejected by every browser, and scroll does not count as activation — only a
 * click, tap or keypress does. So the nearest thing to "always fullscreen" is:
 * prompt on arrival, enter on the visitor's first gesture, stay until Escape.
 *
 * `settled` lives at module scope on purpose. It resets on a full page load, so
 * a reload always offers fullscreen again, but survives client-side navigation
 * and StrictMode's double mount, so leaving with Escape is not undone by the
 * next click.
 *
 * Escape itself is the browser's own; we only track fullscreenchange.
 */

'use client';

import {useEffect, useState} from 'react';

const NOTICE_MS = 6000;
// Keys that are navigation or dismissal, never "I am engaging with the page".
const IGNORED_KEYS = new Set(['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta']);
const GESTURES = ['pointerdown', 'touchstart', 'keydown'] as const;

let settled = false;

type Phase = 'hidden' | 'prompt' | 'active';

export default function FullscreenNotice() {
  const [phase, setPhase] = useState<Phase>('hidden');
  // Tracked separately from `phase`: the notice auto-hides after NOTICE_MS but
  // the page is still fullscreen, and the label must not revert to the prompt
  // while it is — aria-live would announce the wrong instruction.
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E === 'true') return;
    const root = document.documentElement;
    if (!root.requestFullscreen) return;

    let hideTimer: ReturnType<typeof setTimeout>;
    let pending = false;

    const detach = () => {
      for (const type of GESTURES) removeEventListener(type, onGesture);
    };

    function onGesture(event: Event) {
      if (event.type === 'keydown' && IGNORED_KEYS.has((event as KeyboardEvent).key)) return;
      if (pending || settled || document.fullscreenElement) return;
      pending = true;
      // Stay armed until the request resolves: a rejected one must leave the
      // listeners in place so the next gesture can try again.
      root.requestFullscreen({navigationUI: 'hide'}).catch(() => {
        pending = false;
      });
    }

    const onChange = () => {
      clearTimeout(hideTimer);
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement) {
        detach();
        setPhase('active');
        hideTimer = setTimeout(() => setPhase('hidden'), NOTICE_MS);
        return;
      }
      // Left fullscreen — that is Escape, and it is respected for this page
      // view. A reload re-arms everything.
      settled = true;
      detach();
      setPhase('hidden');
    };

    if (document.fullscreenElement) {
      queueMicrotask(() => {
        setIsFullscreen(true);
        setPhase('active');
      });
      hideTimer = setTimeout(() => setPhase('hidden'), NOTICE_MS);
    } else if (!settled) {
      queueMicrotask(() => setPhase('prompt'));
      for (const type of GESTURES) addEventListener(type, onGesture, {passive: true});
    }
    document.addEventListener('fullscreenchange', onChange);

    return () => {
      detach();
      document.removeEventListener('fullscreenchange', onChange);
      clearTimeout(hideTimer);
    };
  }, []);

  return <div className="fullscreen-note" data-visible={phase !== 'hidden'} role="status" aria-live="polite">
    <span aria-hidden="true">⛶</span>
    {isFullscreen ? 'Press Esc to exit full screen' : 'Click anywhere for full screen'}
  </div>;
}
