'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
export type MotionMode='full'|'calm';
export type DeviceTier=1|2|3;
interface ContextValue {mode:MotionMode;setMode:(mode:MotionMode)=>void}
export const MotionModeContext=createContext<ContextValue|null>(null);
export function readInitialMotionMode():MotionMode {
 if(typeof document==='undefined') return 'full';
 const explicit=document.documentElement.dataset.motion;
 return explicit==='calm'||(explicit!=='full'&&matchMedia('(prefers-reduced-motion: reduce)').matches)?'calm':'full';
}
export function useMotionModeState():ContextValue {
 const [mode,setState]=useState<MotionMode>('full');
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setState(readInitialMotionMode());sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
 const setMode=useCallback((next:MotionMode)=>{setState(next);document.documentElement.dataset.motion=next;try{localStorage.setItem('motion-mode',next);document.cookie=`motion-mode=${next}; path=/; max-age=31536000; samesite=lax`;}catch{/* Preference still applies in memory. */}},[]);
 return useMemo(()=>({mode,setMode}),[mode,setMode]);
}
export function useMotionMode(){const value=useContext(MotionModeContext);if(!value)throw new Error('Missing MotionRoot');return value;}
export function useTier():DeviceTier {
 const [tier,setTier]=useState<DeviceTier>(1);
 useEffect(()=>{const forced=Number(new URLSearchParams(location.search).get('tier'));const nav=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}};const canvas=document.createElement('canvas');const gl=canvas.getContext('webgl2');let detected:DeviceTier=!gl||nav.connection?.saveData||(nav.deviceMemory??4)<=2||(!nav.deviceMemory&&nav.hardwareConcurrency<=4)?1:matchMedia('(pointer:fine)').matches&&nav.hardwareConcurrency>=8?3:2;gl?.getExtension('WEBGL_lose_context')?.loseContext();if([1,2,3].includes(forced))detected=forced as DeviceTier;queueMicrotask(()=>setTier(detected));document.documentElement.dataset.tier=String(detected);},[]);
 return tier;
}
