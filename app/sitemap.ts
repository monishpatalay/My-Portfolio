import type {MetadataRoute} from 'next';
import {getContent} from '@/lib/content/server';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const {projects}=await getContent();const base=process.env.NEXT_PUBLIC_SITE_URL??'https://www.monishpatalay.dev';return['','/work','/playground',...projects.map(p=>`/work/${p.slug}`)].map(path=>({url:base+path,changeFrequency:'monthly',priority:path===''?1:.7}));}
