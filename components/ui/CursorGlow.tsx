'use client';
import {useEffect, useRef} from 'react';

// A soft spotlight that tracks the pointer site-wide. Position is written once
// per frame straight to the element (no React state), and the look lives in
// styles/media-cursor.css so it only exists on mouse/trackpad devices.
export default function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = glow.current;
    if (!el || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let frame = 0, x = 0, y = 0;
    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      el.dataset.visible = 'true';
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) el.dataset.visible = 'false';
    };
    addEventListener('pointermove', move, {passive: true});
    document.addEventListener('pointerout', leave);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', leave);
    };
  }, []);
  return <div ref={glow} className="cursor-glow" aria-hidden="true" />;
}
