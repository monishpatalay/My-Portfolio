/**
 * Preloader — the first-load greeting overlay.
 *
 * Ported from a Framer canvas component. Three things had to change to run in
 * Next.js rather than inside Framer:
 *
 *  - `framer`'s addPropertyControls / ControlType / useIsStaticRenderer do not
 *    exist outside the Framer editor. Property controls become plain props with
 *    defaults, and the static-render branch is gone: this is mounted with
 *    ssr:false, so it only ever runs live in the browser.
 *  - `framer-motion` is imported as `motion/react`, the package's current name
 *    and the copy already in this project. No second animation library.
 *  - The Google Fonts @import is dropped — JetBrains Mono is already self-hosted
 *    via next/font, and the CSP in proxy.ts would block the request anyway.
 *
 * Reduced motion comes from the site's own Full/Calm governor rather than a
 * private matchMedia call, so the nav toggle affects the preloader too.
 */

'use client';

import {useEffect, useMemo, useState, useSyncExternalStore} from 'react';
import {cubicBezier} from 'motion/react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useMotionMode} from '@/lib/motion/governor';
import {getLenis} from '@/lib/motion/loop';

interface PreloaderProps {
  title?: string;
  greetings?: string[];
  duration?: number;
  backgroundColor?: string;
  cardColor?: string;
  borderColor?: string;
  glowColor?: string;
  warmGlowColor?: string;
  textColor?: string;
  titleColor?: string;
  cardBlur?: number;
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  greetingSize?: number;
  titleSize?: number;
  showBorderGlow?: boolean;
  borderGlowWidth?: number;
  borderGlowSpeed?: number;
}

type StageData = {
  greetingY: number;
  greetingContainerOpacity: number;
  greetingBlur: number;
  titleOpacity: number;
  titleRevealProgress: number;
  exitOpacity: number;
  exitScale: number;
  exitBlur: number;
  done: boolean;
};

const MESH_BLOBS = [
  {left: '14%', top: '20%', width: 440, height: 280, colorMix: 0.12, blur: 64, delay: 0},
  {left: '48%', top: '72%', width: 360, height: 220, colorMix: 0.28, blur: 58, delay: 1.2},
  {left: '70%', top: '18%', width: 420, height: 300, colorMix: 0.72, blur: 68, delay: 0.6},
  {left: '86%', top: '62%', width: 320, height: 210, colorMix: 0.46, blur: 54, delay: 1.8},
];

const GREETING_FONT = '"SF Pro Display", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", Roboto, "Noto Sans Arabic", "Noto Sans Devanagari", sans-serif';
const TITLE_FONT = 'var(--font-jetbrains-mono), "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const mixColor = (a: string, b: string, ratio: number) => {
  const r = clamp01(ratio) * 100;
  return `color-mix(in srgb, ${a} ${100 - r}%, ${b} ${r}%)`;
};

const MIN_DURATION_SEC = 2;
const noSubscribe = () => () => {};

function getStage(
  elapsed: number,
  duration: number,
  greetingsLength: number,
  reducedMotion: boolean,
  exitEase: (t: number) => number,
  reelEase: (t: number) => number,
): StageData {
  const safeDuration = Math.max(MIN_DURATION_SEC, duration);
  const exitAnimSec = 0.45;
  const titleFadeInSec = 0.3;
  // Title hold and greeting fade scale with the duration, so a short intro
  // still plays the whole reel and the title rather than dropping one.
  const titleHoldSec = Math.min(1.5, safeDuration * 0.2);
  const greetingFadeSec = Math.min(0.4, safeDuration * 0.08);
  const exitStartSec = Math.max(safeDuration - exitAnimSec, 0.5);
  const titleStartSec = Math.max(0, exitStartSec - titleHoldSec - titleFadeInSec);
  const greetingFadeEndSec = titleStartSec;
  const greetingMoveEndSec = Math.max(0, greetingFadeEndSec - greetingFadeSec);
  const tSec = elapsed;

  if (reducedMotion) {
    const exiting = tSec >= exitStartSec ? 1 - clamp01((tSec - exitStartSec) / exitAnimSec) : 1;
    return {
      greetingY: greetingsLength - 1,
      greetingContainerOpacity: tSec < greetingFadeEndSec ? 1 : 0,
      greetingBlur: 0,
      titleOpacity: tSec >= greetingFadeEndSec ? exiting : 0,
      titleRevealProgress: tSec >= greetingFadeEndSec ? 1 : 0,
      exitOpacity: exiting,
      exitScale: 1,
      exitBlur: 0,
      done: tSec >= safeDuration,
    };
  }

  const slots = Math.max(1, greetingsLength);
  const steps = Math.max(1, slots - 1);
  const reelProgress = greetingMoveEndSec > 0 ? clamp01(tSec / greetingMoveEndSec) : 1;
  let reelOffset = 0;

  if (slots <= 1 || tSec >= greetingMoveEndSec) {
    reelOffset = slots - 1;
  } else {
    const stepProgress = reelProgress * steps;
    const stepIndex = Math.floor(stepProgress);
    const local = clamp01(stepProgress - stepIndex);
    const dwell = 0.32;
    const snap = local <= dwell ? 0 : reelEase(clamp01((local - dwell) / (1 - dwell)));
    reelOffset = Math.min(slots - 1, stepIndex + snap);
  }

  const fadeOutT = greetingFadeEndSec > greetingMoveEndSec
    ? clamp01((tSec - greetingMoveEndSec) / (greetingFadeEndSec - greetingMoveEndSec))
    : 1;
  const greetingContainerOpacity = tSec < greetingMoveEndSec ? 1 : 1 - exitEase(fadeOutT);
  const titleT = titleFadeInSec > 0 ? clamp01((tSec - greetingFadeEndSec) / titleFadeInSec) : 1;
  const titleRevealProgress = exitEase(titleT);
  const titleOpacity = tSec <= greetingFadeEndSec ? 0 : titleRevealProgress;
  const exitProgress = exitEase(exitAnimSec > 0 ? clamp01((tSec - exitStartSec) / exitAnimSec) : 1);

  return {
    greetingY: reelOffset,
    greetingContainerOpacity,
    greetingBlur: (1 - greetingContainerOpacity) * 10,
    titleOpacity: tSec >= exitStartSec ? (1 - exitProgress) * titleOpacity : titleOpacity,
    titleRevealProgress,
    exitOpacity: 1 - exitProgress,
    exitScale: 1 + 0.05 * exitProgress,
    exitBlur: exitProgress * 14,
    done: tSec >= safeDuration,
  };
}

export default function Preloader({
  title = 'Loading… Please do not smash your screen.',
  greetings = ['Ciao', 'مرحبا', 'Bonjour', 'Hola', 'नमस्ते', 'Hello'],
  duration = 2.4,
  backgroundColor = '#070709',
  cardColor = 'rgba(18, 18, 24, 0.62)',
  borderColor = 'rgba(255,255,255,0.08)',
  glowColor = '#7A5CFF',
  warmGlowColor = '#B5654A',
  textColor = '#F5F2FF',
  titleColor = '#FFFFFF',
  cardBlur = 24,
  radius = 28,
  cardWidth = 620,
  cardHeight = 280,
  greetingSize = 56,
  titleSize = 26,
  showBorderGlow = true,
  borderGlowWidth = 2,
  borderGlowSpeed = 3,
}: PreloaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsActive] = useState(true);
  // The layout's pre-paint script marks a tab that has already entered the site;
  // hydration starts from the server's "not seen", then drops the overlay.
  const introSeen = useSyncExternalStore(noSubscribe, () => document.documentElement.dataset.intro === 'seen', () => false);
  const isActive = isRunning && !introSeen;
  const {mode} = useMotionMode();
  const reducedMotion = mode === 'calm';

  const exitEase = useMemo(() => cubicBezier(0.16, 1, 0.3, 1), []);
  const reelEase = useMemo(() => cubicBezier(0.25, 1, 0.5, 1), []);

  // "Hello" always lands last, whatever order the greetings arrive in.
  const reel = useMemo(() => {
    const clean = greetings.filter(item => typeof item === 'string' && item.trim().length > 0);
    const source = clean.length ? clean : ['Hello'];
    return [...source.filter(item => item.trim().toLowerCase() !== 'hello'), 'Hello'];
  }, [greetings]);

  const titleWords = useMemo(() => title.trim().split(/\s+/).filter(Boolean), [title]);
  const stage = useMemo(
    () => getStage(elapsed, duration, reel.length, reducedMotion, exitEase, reelEase),
    [elapsed, duration, reel.length, reducedMotion, exitEase, reelEase],
  );

  useEffect(() => {
    if (!isActive) return;
    let start: number | null = null;
    let raf = 0;
    const tick = (time: number) => {
      if (start === null) start = time;
      const currentSec = (time - start) / 1000;
      setElapsed(currentSec);
      if (currentSec >= Math.max(MIN_DURATION_SEC, duration)) {
        setIsActive(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration, isActive]);

  // Hold the page still while the overlay owns the screen.
  useEffect(() => {
    if (!isActive) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevTouch = body.style.touchAction;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.touchAction = 'none';

    const blockKeys = (event: KeyboardEvent) => {
      // Never swallow Escape — it is how a visitor leaves fullscreen.
      if (event.key === 'Escape' || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
    };
    addEventListener('keydown', blockKeys, {capture: true});

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.touchAction = prevTouch;
      removeEventListener('keydown', blockKeys, {capture: true});
      // Lenis and ScrollTrigger start with the page and measure it while this
      // lock is on, so both cache a scroll limit of zero and the page refuses
      // to scroll once the overlay leaves. Re-measure after the browser has
      // laid the unlocked document out again.
      requestAnimationFrame(() => {
        getLenis()?.resize();
        ScrollTrigger.refresh();
      });
    };
  }, [isActive]);

  if (!isActive || stage.done) return null;

  const rowHeight = Math.max(68, greetingSize * 1.3);
  const viewportHeight = rowHeight * 2.2;
  const yTranslation = (viewportHeight - rowHeight) / 2 - stage.greetingY * rowHeight;

  // Rendered inline rather than portalled into document.body: a portal cannot
  // run during server rendering, and this must be in the very first paint or
  // the landing page flashes before the overlay arrives. z-index keeps it above
  // everything regardless of where it sits in the tree.
  return (
    <div data-preloader style={{position: 'fixed', inset: 0, zIndex: 2147483647, pointerEvents: 'auto'}}>
      <div
        role="dialog"
        aria-modal
        aria-label="Loading"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: backgroundColor,
          overflow: 'hidden',
          opacity: stage.exitOpacity,
          transform: `scale3d(${stage.exitScale}, ${stage.exitScale}, 1)`,
          filter: stage.exitBlur > 0.1 ? `blur(${stage.exitBlur}px)` : 'none',
          transformOrigin: 'center center',
          userSelect: 'none',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.045, pointerEvents: 'none', zIndex: 1}} aria-hidden="true">
          <filter id="preloaderNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#preloaderNoise)" />
        </svg>

        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
          <div style={{position: 'relative', width: 'min(960px, 90vw)', height: 'min(560px, 80vh)'}}>
            {MESH_BLOBS.map((blob, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: blob.left,
                  top: blob.top,
                  width: blob.width,
                  height: blob.height,
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: `radial-gradient(ellipse at center, ${mixColor(glowColor, warmGlowColor, blob.colorMix)} 0%, transparent 70%)`,
                  filter: `blur(${blob.blur}px)`,
                  opacity: 0.65,
                  animation: reducedMotion
                    ? 'none'
                    : `preloaderMeshFloat${index} ${12 + index}s cubic-bezier(0.45, 0.05, 0.55, 0.95) ${blob.delay}s infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>

        <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 50%, transparent 40%, ${backgroundColor} 92%)`, pointerEvents: 'none'}} />

        <div
          style={{
            position: 'relative',
            width: `min(${cardWidth}px, calc(100% - 40px))`,
            height: cardHeight,
            borderRadius: radius,
            border: `1px solid ${borderColor}`,
            background: cardColor,
            backdropFilter: `blur(${cardBlur}px) saturate(140%)`,
            WebkitBackdropFilter: `blur(${cardBlur}px) saturate(140%)`,
            boxShadow: `0 30px 60px -12px rgba(0,0,0,0.56), 0 0 40px -10px color-mix(in srgb, ${glowColor} 20%, transparent)`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {showBorderGlow && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: radius,
                padding: borderGlowWidth,
                pointerEvents: 'none',
                zIndex: 1,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                overflow: 'hidden',
              }}
            >
              {[
                {gradient: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${glowColor} 330deg, #FFFFFF 360deg)`, blur: undefined},
                {gradient: `conic-gradient(from 0deg, transparent 0deg, transparent 240deg, ${mixColor(glowColor, warmGlowColor, 0.4)} 310deg, #FFFFFF 360deg)`, blur: 'blur(6px)'},
              ].map((layer, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '300%',
                    aspectRatio: '1 / 1',
                    transform: 'translate(-50%, -50%)',
                    background: layer.gradient,
                    filter: layer.blur,
                    animation: reducedMotion ? 'none' : `orbitBorderGlow ${borderGlowSpeed}s linear infinite`,
                    transformOrigin: 'center center',
                    willChange: 'transform',
                  }}
                />
              ))}
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: radius,
              pointerEvents: 'none',
              border: '1px solid transparent',
              borderTopColor: 'rgba(255, 255, 255, 0.18)',
              maskImage: 'linear-gradient(to bottom, black, transparent 40%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 40%)',
            }}
          />

          {stage.greetingContainerOpacity > 0.001 && (
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                color: textColor,
                fontFamily: GREETING_FONT,
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
                fontSize: `clamp(36px, ${(greetingSize / 600) * 100}vw, ${greetingSize}px)`,
                textAlign: 'center',
                opacity: stage.greetingContainerOpacity,
                filter: reducedMotion ? 'none' : `blur(${stage.greetingBlur}px)`,
                textShadow: `0 0 32px color-mix(in srgb, ${glowColor} 48%, transparent)`,
                width: '100%',
                height: viewportHeight,
                overflow: 'hidden',
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 18%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.4) 82%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 18%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.4) 82%, transparent 100%)',
              }}
            >
              <div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translate3d(0, ${yTranslation}px, 0)`, willChange: 'transform'}}>
                {reel.map((greeting, index) => {
                  const dist = Math.abs(index - stage.greetingY);
                  const opacity = reducedMotion
                    ? (index === reel.length - 1 ? 1 : 0.2)
                    : Math.max(0.12, 1 - Math.pow(dist, 1.2) * 0.72);
                  const itemScale = Math.max(0.88, 1 - dist * 0.08);
                  return (
                    <div
                      key={`${greeting}-${index}`}
                      style={{
                        height: rowHeight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity,
                        transform: `scale3d(${itemScale}, ${itemScale}, 1)`,
                        willChange: 'transform, opacity',
                        width: '100%',
                      }}
                    >
                      <span style={{transform: 'translateZ(0)'}}>{greeting}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {stage.titleOpacity > 0.001 && (
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                color: titleColor,
                fontFamily: TITLE_FONT,
                fontWeight: 500,
                letterSpacing: '-0.015em',
                lineHeight: 1.35,
                fontSize: `clamp(16px, ${(titleSize / 560) * 100}vw, ${titleSize}px)`,
                textAlign: 'center',
                opacity: stage.titleOpacity,
                textShadow: `0 0 32px color-mix(in srgb, ${glowColor} 58%, transparent)`,
                padding: '0 28px',
                maxWidth: 'min(92vw, 620px)',
                perspective: '1000px',
              }}
            >
              <span style={{position: 'absolute', opacity: 0, pointerEvents: 'none'}}>{title}</span>
              <span aria-hidden="true">
                {titleWords.map((word, index) => {
                  const wordStep = titleWords.length > 1 ? 0.3 / (titleWords.length - 1) : 0;
                  const wordStart = index * wordStep;
                  const eased = reducedMotion
                    ? 1
                    : exitEase(clamp01((stage.titleRevealProgress - wordStart) / (1 - wordStart)));
                  return (
                    <span
                      key={`${word}-${index}`}
                      style={{
                        display: 'inline-block',
                        opacity: eased,
                        transform: `translate3d(0, ${(1 - eased) * 16}px, 0) rotateX(${(1 - eased) * 16}deg) scale3d(${0.96 + eased * 0.04}, ${0.96 + eased * 0.04}, 1)`,
                        filter: `blur(${(1 - eased) * 8}px)`,
                        transformOrigin: '50% 100%',
                        willChange: 'transform, opacity, filter',
                      }}
                    >
                      {word}
                      {index < titleWords.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
