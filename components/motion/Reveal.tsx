/* eslint-disable react-hooks/refs */
'use client';
import {useEffect,useRef,type PropsWithChildren,createElement} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {dur} from '@/lib/motion/tokens';
import {useMotionMode} from '@/lib/motion/governor';
gsap.registerPlugin(ScrollTrigger);
export default function Reveal({as='div',variant='up',delay=0,className='',children}:PropsWithChildren<{as?:'div'|'p'|'h1'|'h2'|'h3'|'section';variant?:'fade'|'up'|'mask';delay?:number;className?:string}>){const ref=useRef<HTMLElement>(null);const {mode}=useMotionMode();useEffect(()=>{if(mode==='calm'||!ref.current)return;const ctx=gsap.context(()=>{gsap.from(ref.current,{y:variant==='fade'?0:24,duration:dur.slow,ease:'out',delay,scrollTrigger:{trigger:ref.current,start:'top 90%',once:true}});});return()=>ctx.revert();},[mode,variant,delay]);return createElement(as,{ref,className},children);}
