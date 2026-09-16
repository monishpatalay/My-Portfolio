'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import MotionToggle from '@/components/motion/MotionToggle';
export function LocalTime(){const [time,setTime]=useState('Los Angeles');useEffect(()=>{const tick=()=>setTime(new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+' in Los Angeles');tick();const timer=setInterval(tick,60000);return()=>clearInterval(timer);},[]);return <span className="mono">{time}</span>;}
export default function Footer(){return <footer className="site-footer"><div className="footer-top"><Link href="/">Monish Patalay</Link><LocalTime/><MotionToggle/></div><details><summary>Privacy & motion</summary><p>Analytics are cookieless. A functional cookie remembers your Full or Calm preference. Chat messages are processed by an AI provider; opt-in questions, answers, and ratings are kept for 90 days. Drawings stay in your browser. Your game best is saved on this device.</p></details><div className="footer-bottom"><span>Thoughtfully built. Always learning.</span><Link href="/#hero">Back to top ↑</Link></div></footer>;}
