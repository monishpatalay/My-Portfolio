'use client';
import {useEffect,useRef,useState,useLayoutEffect} from 'react';
import {usePathname,useRouter,useSearchParams} from 'next/navigation';
import gsap from 'gsap';
import {Flip} from 'gsap/Flip';
import ProjectCard from '@/components/rail/ProjectCard';
import type {Project} from '@/lib/content/data';
import {useMotionMode} from '@/lib/motion/governor';
import {dur} from '@/lib/motion/tokens';
gsap.registerPlugin(Flip);
const filters=[['all','All projects'],['ai-ml','AI & ML'],['full-stack','Full stack'],['computer-vision','Computer vision'],['web','Web']];
export default function WorkIndex({projects}:{projects:Project[]}){const search=useSearchParams(),router=useRouter(),path=usePathname();const filter=search.get('category')??'all';const [list,setList]=useState(false);const root=useRef<HTMLDivElement>(null),saved=useRef<ReturnType<typeof Flip.getState>|null>(null);const {mode}=useMotionMode();useEffect(()=>{try{queueMicrotask(()=>setList(localStorage.getItem('work-layout')==='list'));}catch{/* Browser storage is optional. */}},[]);useLayoutEffect(()=>{if(saved.current&&mode==='full'){const tween=Flip.from(saved.current,{duration:dur.slow,ease:'io',absolute:true,stagger:.02});saved.current=null;return()=>{tween.kill();};}},[filter,list,mode]);const capture=()=>{if(root.current)saved.current=Flip.getState(root.current.querySelectorAll('.work-item'));};const visible=filter==='all'?projects:projects.filter(p=>p.category===filter);return <><div className="work-toolbar"><div className="work-filters" aria-label="Filter projects">{filters.map(([value,label])=><button className="chip" key={value} aria-pressed={filter===value} onClick={()=>{capture();router.replace(value==='all'?path:`${path}?category=${value}`,{scroll:false});}}>{label}</button>)}</div><button className="chip" aria-pressed={list} onClick={()=>{capture();setList(!list);try{localStorage.setItem('work-layout',list?'grid':'list');}catch{/* Browser storage is optional. */}}}>{list?'⊞ Grid view':'☷ List view'}</button></div><div ref={root} className={`work-grid ${list?'list-view':''}`}>{visible.map((project,i)=><div className="work-item" key={project._id} data-flip-id={project._id}><ProjectCard project={project} index={i}/></div>)}</div>{!visible.length&&<p className="empty-state" role="status">No projects in this category yet.</p>}</>;}
