'use client';
import {useEffect,useRef,type PropsWithChildren} from 'react';

import {usePathname} from 'next/navigation';
import dynamic from 'next/dynamic';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {MotionConfig} from 'motion/react';
import {startMotionLoop,stopMotionLoop,getLenis} from '@/lib/motion/loop';
import {MotionModeContext,useMotionModeState} from '@/lib/motion/governor';
import {dur} from '@/lib/motion/tokens';
const Particles=dynamic(()=>import('@/components/particles/ParticleCanvas'),{ssr:false});
export default function MotionRoot({children}:PropsWithChildren){const state=useMotionModeState();const path=usePathname();const progress=useRef<HTMLDivElement>(null);const lastPath=useRef<string|null>(null);
 useEffect(()=>{const media=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');const start=()=>{startMotionLoop(state.mode);ScrollTrigger.refresh();};start();media.addEventListener('change',start);return()=>{media.removeEventListener('change',start);stopMotionLoop();};},[state.mode]);
 useEffect(()=>{
 // Lenis writes its cached position to the window every frame, so Next's
 // scroll-to-top on a route change is undone on the next tick and the reader
 // lands at the previous page's offset — often past the new page's end, where
 // scrolling down does nothing. Reset Lenis itself, not just the window.
 // Skipped for hash links, which are meant to land somewhere other than top.
 // Reset the window first, then Lenis. The new route's document is shorter, so
 // the browser clamps the carried-over offset and fires a scroll event; the
 // desync guard in loop.ts would make Lenis adopt that clamped value and undo a
 // Lenis-only reset. Zeroing the window leaves nothing to clamp.
 // Re-asserted across the next two frames: leaving a page whose rail was pinned
 // makes GSAP tear down the pin-spacer and restore the scroll it had recorded,
 // which lands after this effect and would otherwise win.
 if(lastPath.current!==null&&lastPath.current!==path&&!location.hash){
  const toTop=()=>{scrollTo(0,0);getLenis()?.scrollTo(0,{immediate:true,force:true});};
  toTop();
  requestAnimationFrame(()=>{toTop();requestAnimationFrame(toTop);});
 }
 lastPath.current=path;
 const frame=requestAnimationFrame(()=>{document.fonts.ready.then(()=>ScrollTrigger.refresh());});
 // Fonts are not the only thing that resizes the page: the rail's pin length is
 // derived from its track width, and covers stream in from the CMS after first
 // paint. Refresh once everything has loaded so the pin cannot be short.
 const onLoad=()=>ScrollTrigger.refresh();if(document.readyState==='complete')onLoad();else addEventListener('load',onLoad);const click=(event:MouseEvent)=>{const a=(event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');if(!a||event.metaKey||event.ctrlKey)return;const id=a.getAttribute('href');if(!id||id==='#'||id==='#ask')return;const target=document.getElementById(id.slice(1));if(!target)return;event.preventDefault();const lenis=getLenis();if(lenis)lenis.scrollTo(target,{offset:-90,duration:dur.reveal,onComplete:()=>{target.tabIndex=-1;target.focus({preventScroll:true});}});else target.scrollIntoView();history.replaceState(null,'',id);};document.addEventListener('click',click);return()=>{cancelAnimationFrame(frame);removeEventListener('load',onLoad);document.removeEventListener('click',click);};},[path]);
 useEffect(()=>{const update=()=>{if(progress.current)progress.current.style.transform=`scaleX(${scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)})`;};addEventListener('scroll',update,{passive:true});update();return()=>removeEventListener('scroll',update);},[path]);
 return <MotionModeContext.Provider value={state}><MotionConfig reducedMotion={state.mode==='calm'?'always':'never'}><div className="portfolio-shell"><div className="grain" aria-hidden="true"/><Particles/><div className="reading-progress" ref={progress} aria-hidden="true"/>{children}</div></MotionConfig></MotionModeContext.Provider>;
}
