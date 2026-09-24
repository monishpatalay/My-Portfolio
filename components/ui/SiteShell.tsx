'use client';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import dynamic from 'next/dynamic';
import MotionRoot from '@/components/motion/MotionRoot';
import Nav from './Nav';
import Footer from './Footer';
import Preloader from './Preloader';
const Chat=dynamic(()=>import('@/components/chat/Chat'),{ssr:false});
const FullscreenNotice=dynamic(()=>import('./FullscreenNotice'),{ssr:false});
// Imported eagerly, not via dynamic(ssr:false): the overlay has to be in the
// server HTML, or the landing page paints for a frame before it appears.
// The intro plays once per tab, and only when the visit starts on the home page:
// deep links from search or shares open straight onto their content.
export default function SiteShell({children}:{children:React.ReactNode}){const path=usePathname(),[entryPath]=useState(path);if(path.startsWith('/studio'))return children;return <MotionRoot>{entryPath==='/'&&<Preloader/>}<Nav/>{children}<Footer/><Chat/><FullscreenNotice/></MotionRoot>;}
