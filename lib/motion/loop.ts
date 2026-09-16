import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Lenis from 'lenis';
import { ease } from './tokens';
import type { MotionMode } from './governor';
type VirtualData = {deltaX:number; deltaY:number; event:WheelEvent | TouchEvent};
let lenis: Lenis | null = null;
let interceptor: ((data: VirtualData) => boolean) | null = null;
let resync: (() => void) | null = null;
let remeasure: (() => void) | null = null;
gsap.registerPlugin(ScrollTrigger, CustomEase);
for (const [name,p] of Object.entries(ease)) CustomEase.create(name,`M0,0 C${p[0]},${p[1]} ${p[2]},${p[3]} 1,1`);
ScrollTrigger.config({ignoreMobileResize:true});
const tick = (time:number) => lenis?.raf(time * 1000);
export function startMotionLoop(mode: MotionMode = 'full') {
  stopMotionLoop();
  if (mode === 'calm' || !matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches) return null;
  lenis = new Lenis({autoRaf:false,lerp:0.075,wheelMultiplier:0.85,smoothWheel:true,syncTouch:false,virtualScroll:data=>interceptor?.(data) ?? true});
  lenis.on('scroll',ScrollTrigger.update);
  // A native scroll — a focus ring pulling a control into view, an anchor jump,
  // the browser clamping after the document shrinks — moves the window without
  // telling Lenis, so its target goes stale. The next frame then drags the page
  // back to that stale position, which lands inside the pinned project rail and
  // reads as an unrequested jump to the projects. Adopt the window's position
  // whenever it drifts while Lenis itself is idle.
  resync = () => {
    if (!lenis || lenis.isScrolling) return;
    if (Math.abs(scrollY - lenis.targetScroll) < 2) return;
    lenis.scrollTo(scrollY,{immediate:true,force:true});
  };
  addEventListener('scroll',resync,{passive:true});
  // Every GSAP pin inserts a pin-spacer, which changes the document height.
  // Lenis caches its own scroll limit and clamps to it, so a limit measured
  // before the spacer existed strands the reader at whichever section pinned —
  // the project rail, in practice. ScrollTrigger fires "refresh" whenever that
  // geometry is (re)built, so re-measure Lenis on the same signal.
  remeasure = () => lenis?.resize();
  ScrollTrigger.addEventListener('refresh',remeasure);
  gsap.ticker.add(tick,false,true);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
export const getLenis = () => lenis;
export function setRailInterceptor(fn:typeof interceptor) {interceptor=fn;}
export function stopMotionLoop() { gsap.ticker.remove(tick); if(resync){removeEventListener('scroll',resync);resync=null;} if(remeasure){ScrollTrigger.removeEventListener('refresh',remeasure);remeasure=null;} lenis?.destroy(); lenis=null; }
