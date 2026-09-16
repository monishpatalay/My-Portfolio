'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import MotionToggle from '@/components/motion/MotionToggle';
import ThemeToggle from './ThemeToggle';
import FullscreenToggle from './FullscreenToggle';
import AskButton from './AskButton';
export default function Nav(){const path=usePathname();const [scrolled,setScrolled]=useState(false);useEffect(()=>{const update=()=>setScrolled(scrollY>80);update();addEventListener('scroll',update,{passive:true});return()=>removeEventListener('scroll',update);},[]);return <><a href="#main" className="skip-link">Skip to content</a><header className={`site-header ${scrolled?'scrolled':''}`}><nav aria-label="Main"><Link href="/" className="wordmark" aria-label="Monish Patalay home">m<span>p</span><i>®</i></Link><div className="nav-links"><Link aria-current={path.startsWith('/work')?'page':undefined} href="/work">Work</Link><Link aria-current={path==='/playground'?'page':undefined} href="/playground">Playground</Link><a href="/resume" target="_blank" rel="noopener noreferrer">Résumé<span className="sr-only"> (new tab)</span></a></div><div className="nav-actions"><FullscreenToggle/><ThemeToggle/><MotionToggle/><AskButton className="button nav-ai">Ask AI <span aria-hidden="true">✳</span></AskButton></div></nav></header></>;}
