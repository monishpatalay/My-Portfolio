import {z} from 'zod';
export const messageSchema=z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(1000)}).strict();
export const chatSchema=z.object({messages:z.array(messageSchema).min(1).max(20),improve:z.boolean().default(false)}).strict().refine(body=>body.messages.reduce((sum,m)=>sum+m.content.length,0)<=6000,'Conversation too long').refine(body=>body.messages.at(-1)?.role==='user','Last message must be a user message');
export const feedbackSchema=z.object({id:z.string().uuid(),rating:z.enum(['up','down']),improve:z.literal(true)}).strict();
export function allowedOrigin(origin:string|null,site:string,preview?:string){if(!origin)return false;const allowed=new Set([new URL(site).origin]);if(preview)allowed.add(`https://${preview}`);if(process.env.NODE_ENV!=='production'){allowed.add('http://localhost:3000');allowed.add('http://127.0.0.1:3000');}return allowed.has(origin);}
export function safeLink(href:string){if(/^\/(?!\/)/.test(href))return true;try{const url=new URL(href);return url.protocol==='https:'&&['github.com','www.linkedin.com','linkedin.com','monishpatalay.dev','www.monishpatalay.dev'].includes(url.hostname);}catch{return false;}}
