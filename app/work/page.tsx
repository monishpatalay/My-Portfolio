import {Suspense} from 'react';
import Link from 'next/link';
import {getContent} from '@/lib/content/server';
import WorkIndex from '@/components/chapters/WorkIndex';
import {baseOpenGraph} from '@/lib/site';
const description='Selected AI, machine learning, and full-stack projects by Monish Patalay.';
export const metadata={title:'Work',description,openGraph:{...baseOpenGraph,type:'website',url:'/work',images:['/opengraph-image'],title:'Work — Monish Patalay',description}};
export default async function Work(){const {projects}=await getContent();return <main id="main" className="page-shell"><Link href="/" className="back-link">← Go back</Link><div className="section-kicker">A collection of ideas made real</div><h1 className="page-title">Work. And a little play.</h1><p className="page-intro">Applied AI, considered interfaces, and the engineering that connects them. Explore the details behind each build.</p><Suspense fallback={<p>Loading project filters…</p>}><WorkIndex projects={projects}/></Suspense></main>;}
