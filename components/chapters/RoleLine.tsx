/**
 * RoleLine — the recurring hero role rotation, motion catalog H10 (§13.7).
 * Every 2800ms of dwell: outgoing text leaves yPercent 0→−110 over 420ms on
 * --ease-in (the 0.7 exit ratio of the 600ms entrance), incoming text
 * arrives yPercent 110→0 over 600ms on --ease-out, inside one overflow:
 * hidden mask so the line's height never changes. Paused on hover, focus,
 * off-screen and a hidden tab (each tracked independently, so e.g. the tab
 * becoming visible again doesn't override an active hover-pause). Calm mode
 * shows the first role statically.
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useMotionMode } from "@/lib/motion/governor";

const DWELL_MS = 2800;

interface RoleLineProps {
  roles: string[];
  className?: string;
}

export default function RoleLine({ roles, className }: RoleLineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const { mode } = useMotionMode();

  useEffect(() => {
    if (mode === "calm" || roles.length < 2) return;
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const paused = { hover: false, focus: false, tab: document.hidden, offscreen: true };
    const isPaused = () => paused.hover || paused.focus || paused.tab || paused.offscreen;

    const schedule = () => {
      timeoutId = setTimeout(tick, DWELL_MS);
    };

    const tick = () => {
      if (isPaused()) {
        schedule();
        return;
      }
      gsap
        .timeline()
        .to(text, { yPercent: -110, duration: 0.42, ease: "in" })
        .call(() => {
          index = (index + 1) % roles.length;
          text.textContent = roles[index];
          gsap.set(text, { yPercent: 110 });
        })
        .to(text, { yPercent: 0, duration: 0.6, ease: "out" });
      schedule();
    };

    const onHoverEnter = () => (paused.hover = true);
    const onHoverLeave = () => (paused.hover = false);
    const onFocusIn = () => (paused.focus = true);
    const onFocusOut = () => (paused.focus = false);
    const onVisibility = () => (paused.tab = document.hidden);

    wrap.addEventListener("mouseenter", onHoverEnter);
    wrap.addEventListener("mouseleave", onHoverLeave);
    wrap.addEventListener("focus", onFocusIn, true);
    wrap.addEventListener("blur", onFocusOut, true);
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      paused.offscreen = !entry.isIntersecting;
    });
    io.observe(wrap);

    schedule();

    return () => {
      clearTimeout(timeoutId);
      wrap.removeEventListener("mouseenter", onHoverEnter);
      wrap.removeEventListener("mouseleave", onHoverLeave);
      wrap.removeEventListener("focus", onFocusIn, true);
      wrap.removeEventListener("blur", onFocusOut, true);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, [mode, roles]);

  return (
    <div ref={wrapRef} style={{ overflow: "hidden", display: "inline-block" }}>
      <span ref={textRef} className={className}>
        {roles[0]}
      </span>
    </div>
  );
}
