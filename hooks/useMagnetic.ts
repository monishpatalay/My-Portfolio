/**
 * useMagnetic — quickTo magnetic pull toward the pointer, fine pointers only
 * (PRD §14.3 hook list, motion catalog M10). Disabled entirely on coarse
 * pointers and when the OS prefers reduced motion, via a media-query check
 * rather than reading motion mode, so it degrades correctly for a visitor
 * with no JS-detected preference but a touch device.
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const MAX_PULL = 12;
const HIT_RADIUS_MULTIPLIER = 1.5;

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });

    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const radius = (rect.width / 2) * HIT_RADIUS_MULTIPLIER;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        xTo(0);
        yTo(0);
        return;
      }
      const pull = 1 - dist / radius;
      xTo((dx / radius) * MAX_PULL * pull);
      yTo((dy / radius) * MAX_PULL * pull);
    }

    function onLeave() {
      xTo(0);
      yTo(0);
    }

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return ref;
}
