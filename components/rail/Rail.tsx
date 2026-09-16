'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Observer} from 'gsap/Observer';
import {getLenis,setRailInterceptor} from '@/lib/motion/loop';
import {useMotionMode} from '@/lib/motion/governor';
import {clamp,horizontalDelta,nearestStop,railStops} from '@/lib/motion/rail-math';
import {dur} from '@/lib/motion/tokens';
import type {Project} from '@/lib/content/data';
import ProjectCard from './ProjectCard';
gsap.registerPlugin(ScrollTrigger,Observer);
export default function Rail({projects}:{projects:Project[]}){
 const section=useRef<HTMLElement>(null),viewport=useRef<HTMLDivElement>(null),track=useRef<HTMLOListElement>(null),bar=useRef<HTMLElement>(null);
 const [index,setIndex]=useState(0),[state,setState]=useState('static');const {mode}=useMotionMode();
 useEffect(()=>{const root=section.current,view=viewport.current,list=track.current;if(!root||!view||!list)return;let cancelled=false;const media=gsap.matchMedia();const timer=setTimeout(()=>{if(cancelled)return;
 if(mode==='calm'){setState('stacked');return;}
 media.add('(min-width:1024px) and (hover:hover) and (pointer:fine)',()=>{
 const lenis=getLenis();if(!lenis)return;const max=()=>Math.max(0,list.scrollWidth-view.clientWidth);if(max()<=0){setState('static');return;}setState('pinned');let stops:number[]=[],saved=0,refreshing=false,dragged=false;
 // Declared before the tween because ScrollTrigger fires onUpdate — and so
 // announce() — while gsap.to() is still being constructed, i.e. before the
 // assignment below has run. Reading a `const` there is a dead-zone throw that
 // aborts the rest of this setup.
 // eslint-disable-next-line prefer-const -- assigned below, after the tween that reads it exists
 let st:ScrollTrigger|undefined;
 const announce=()=>{if(!st)return;const current=Math.min(projects.length-1,nearestStop(stops,lenis.scroll-st.start));setIndex(Math.max(0,current));};
 const tween=gsap.to(list,{x:()=>-max(),ease:'none',scrollTrigger:{trigger:root,start:'top top',end:()=>`+=${max()}`,pin:view,scrub:true,invalidateOnRefresh:true,onUpdate:self=>{if(bar.current)bar.current.style.transform=`scaleX(${self.progress})`;if(!refreshing)announce();}}});st=tween.scrollTrigger!;
 const rebuild=()=>{stops=railStops(Array.from(list.children).map(el=>(el as HTMLElement).offsetLeft),parseFloat(getComputedStyle(list).paddingInlineStart)||0,max());if(refreshing&&saved>=0){lenis.scrollTo(st.start+(stops[saved]??max()),{immediate:true});}refreshing=false;};
 const before=()=>{const active=lenis.scroll>=st.start&&lenis.scroll<=st.end;saved=active?nearestStop(stops,lenis.scroll-st.start):-1;refreshing=true;};rebuild();ScrollTrigger.addEventListener('refreshInit',before);ScrollTrigger.addEventListener('refresh',rebuild);
 setRailInterceptor(data=>{const delta=horizontalDelta(data.deltaX,data.deltaY,lenis.targetScroll,st.start,st.end,innerHeight);if(delta===null)return true;if(!delta){data.event.preventDefault();return false;}data.deltaY=delta;data.deltaX=0;return true;});
 const armed=()=>{document.documentElement.style.overscrollBehaviorX=lenis.targetScroll>=st.start-innerHeight*.25&&lenis.targetScroll<=st.end?'none':'';};lenis.on('scroll',armed);
 const jump=(i:number)=>{lenis.scrollTo(st.start+stops[clamp(i,0,stops.length-1)],{duration:dur.slow,onComplete:announce});};
 const key=(event:KeyboardEvent)=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||(event.target as HTMLElement).matches('input,textarea,select'))return;const current=nearestStop(stops,lenis.targetScroll-st.start);let next=current;if(event.key==='ArrowRight'||event.key==='PageDown')next++;else if(event.key==='ArrowLeft'||event.key==='PageUp')next--;else if(event.key==='Home')next=0;else if(event.key==='End')next=stops.length-1;else return;if(next<0||next>=stops.length)return;event.preventDefault();jump(next);};
 const focus=(event:FocusEvent)=>{const item=(event.target as HTMLElement).closest('.rail-item');if(item)jump(Array.from(list.children).indexOf(item));};
 const suppress=(event:MouseEvent)=>{if(dragged){event.preventDefault();event.stopPropagation();dragged=false;}};
 // Observer's release fires for a pointer-up anywhere on the page, not just one
 // that began on the rail. Both handlers clamp into the pinned range, so without
 // these guards a plain click below the rail — on a skill pill, say — drags the
 // reader back up into the projects. Only steer the scroll for a real drag that
 // started while the rail was the pinned section.
 const withinPin=()=>lenis.targetScroll>=st.start&&lenis.targetScroll<=st.end;
 const observer=Observer.create({target:view,type:'pointer',dragMinimum:6,onDragStart:()=>{if(!withinPin())return;dragged=true;view.style.cursor='grabbing';},onDrag:self=>{if(!dragged)return;lenis.scrollTo(clamp(lenis.targetScroll-self.deltaX,st.start,st.end),{immediate:true});},onRelease:self=>{if(!dragged)return;view.style.cursor='grab';lenis.scrollTo(clamp(lenis.targetScroll-self.velocityX*.28,st.start,st.end),{duration:dur.reveal,onComplete:announce});setTimeout(()=>{dragged=false;},0);}});
 root.addEventListener('keydown',key);root.addEventListener('focusin',focus);view.addEventListener('click',suppress,true);ScrollTrigger.refresh();
 return()=>{observer.kill();setRailInterceptor(null);lenis.off('scroll',armed);document.documentElement.style.overscrollBehaviorX='';ScrollTrigger.removeEventListener('refreshInit',before);ScrollTrigger.removeEventListener('refresh',rebuild);root.removeEventListener('keydown',key);root.removeEventListener('focusin',focus);view.removeEventListener('click',suppress,true);tween.revert();setState('static');};
 });},0);
 const io=new IntersectionObserver(entries=>{if(matchMedia('(min-width:1024px) and (pointer:fine)').matches||mode==='calm')return;for(const entry of entries)if(entry.isIntersecting){const i=Array.from(list.children).indexOf(entry.target);setIndex(Math.min(i,projects.length-1));if(bar.current)bar.current.style.transform=`scaleX(${(i+1)/list.children.length})`;}},{root:list,threshold:.6});Array.from(list.children).forEach(child=>io.observe(child));
 return()=>{cancelled=true;clearTimeout(timer);media.revert();io.disconnect();};},[mode,projects]);
 return <section ref={section} id="work" className="rail-section" aria-labelledby="work-heading" data-shape="grid" data-rail-index={index} data-rail-state={state}><div ref={viewport} className="rail-viewport"><div className="rail-head section-head"><div><div className="section-kicker">Selected work / built with intention</div><h2 id="work-heading" className="page-title">Ideas, in the wild.</h2></div><p>A few things I’ve taken from “what if” to “it works.”</p></div><p className="sr-only">Scroll, swipe sideways, or use arrow keys to browse projects.</p><ol ref={track} className="rail-track" role="list">{projects.map((project,i)=><li className="rail-item" key={project._id}><ProjectCard project={project} index={i}/></li>)}<li className="rail-item"><Link href="/work" className="rail-cta"><span aria-hidden="true">↗</span><strong>There’s more.</strong><p>Explore all projects</p></Link></li></ol><div className="rail-status"><span className="mono">{String(index+1).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</span><div className="rail-progress"><i ref={bar}/></div><span className="mono">SCROLL OR DRAG ↔</span></div><span className="sr-only" aria-live="polite">Project {index+1} of {projects.length}, {projects[index]?.title}</span></div></section>;
}
