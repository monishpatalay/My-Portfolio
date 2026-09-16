import {getContent} from '@/lib/content/server';
export async function GET(){const {settings}=await getContent();const url=new URL(settings.resumeUrl);if(url.protocol!=='https:')return new Response('Résumé unavailable',{status:503});return Response.redirect(url,302);}
