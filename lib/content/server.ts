import 'server-only';
import {z} from 'zod';
import {settings,projects,stats,journey,education,skillGroups,achievements,chatFaqs,type Project} from './data';

const projectSchema=z.object({_id:z.string(),slug:z.string().regex(/^[a-z0-9-]+$/),title:z.string(),category:z.string(),summary:z.string(),seoTitle:z.string().optional(),seoDescription:z.string().optional(),techs:z.array(z.string()).default([]),featured:z.boolean().default(false),image:z.string().optional(),previewPlaybackId:z.string().regex(/^[A-Za-z0-9]+$/).optional(),previewThumbTime:z.number().nonnegative().optional(),imageKind:z.string().default('promo'),color:z.string().default('#c7b5f1'),symbol:z.string().default('✳'),role:z.string().default(''),status:z.string().default('Built'),github:z.url().optional(),live:z.url().optional(),metrics:z.array(z.object({value:z.string(),label:z.string(),sourceNote:z.string().min(1)})).default([]),sections:z.array(z.object({title:z.string(),text:z.string()})).default([]),body:z.array(z.unknown()).optional()});

// Experience and education render through the same Timeline component, so they
// share one shape. The CMS field names differ per type (position/company vs
// degree/institution) and are aliased in the GROQ projection below.
const entrySchema=z.object({role:z.string(),organization:z.string(),period:z.string().default(''),location:z.string().default(''),text:z.string().default(''),bullets:z.array(z.string()).default([]),techs:z.array(z.string()).default([])});
const categorySchema=z.object({title:z.string(),tools:z.array(z.string()).default([])});
const achievementSchema=z.object({title:z.string(),detail:z.string().default(''),kind:z.string().default('')});
const faqSchema=z.object({question:z.string(),answer:z.string()});
const aboutSchema=z.object({heading:z.string().min(1),statement:z.string().min(1),note:z.string().optional()});
export type Entry=z.infer<typeof entrySchema>;

// GROQ returns an explicit null for any absent field, but Zod's .optional() and
// .default() only accept `undefined`. Dropping null keys lets an unset field
// fall through to its default instead of failing the whole row.
const stripNulls=(row:unknown)=>row&&typeof row==='object'?Object.fromEntries(Object.entries(row as Record<string,unknown>).filter(([,value])=>value!==null)):row;

// Name the failing document and field on rejection. Without this, schema drift
// in the CMS is indistinguishable from an empty CMS: both serve the fallback.
function parseRows<T>(schema:z.ZodType<T>,rows:unknown,label:string,reviewed:T[]):T[]{
 if(!Array.isArray(rows)||!rows.length)return reviewed;
 const parsed=z.array(schema).safeParse(rows.map(stripNulls));
 if(!parsed.success){console.warn(`CMS ${label} rejected; serving reviewed fallback. First issues:`,parsed.error.issues.slice(0,4).map(issue=>`${issue.path.join('.')}: ${issue.message}`));return reviewed;}
 return parsed.data;
}

export async function getContent(): Promise<{settings:typeof settings;projects:Project[];stats:typeof stats;journey:Entry[];education:Entry[];skillGroups:Record<string,string[]>;achievements:typeof achievements;faqs:typeof chatFaqs}>{
 const fallback={settings,projects,stats,journey,education,skillGroups,achievements,faqs:chatFaqs};const id=process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,dataset=process.env.NEXT_PUBLIC_SANITY_DATASET;if(!id||!dataset)return fallback;
 // One projection per document type in sanity/schemaTypes/index.ts. Identity
 // copy (name, role lines, statement, links) stays in data.ts by design — it is
 // reviewed prose, not something to edit casually.
 const query=`{"projects":*[_type=="project"]|order(order asc){...,"slug":slug.current,"image":cover.asset->url,"previewPlaybackId":previewMux.asset->playbackId,"previewThumbTime":previewMux.asset->thumbTime,"github":links.github,"live":links.live},"stats":*[_type=="stat" && defined(sourceNote)]|order(order asc){value,label,sourceNote},"journey":*[_type=="experience"]|order(order asc){"role":position,"organization":company,period,location,"text":description,"bullets":responsibilities,"techs":technologies},"education":*[_type=="education"]|order(order asc){"role":degree,"organization":institution,period,location,"text":description,"bullets":responsibilities,"techs":technologies},"skillCategories":*[_type=="skillCategory"]|order(order asc){title,tools},"achievements":*[_type=="achievement"]|order(order asc){title,detail,kind},"faqs":*[_type=="chatFaq"]|order(order asc){question,answer},"about":*[_type=="about"]|order(_createdAt asc)[0]{heading,statement,note}}`;
 try{
  const response=await fetch(`https://${id}.api.sanity.io/v2026-09-01/data/query/${dataset}?query=${encodeURIComponent(query)}`,{next:{revalidate:60,tags:['content']},signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw new Error('CMS unavailable');
  const result=(await response.json()).result;

  // One filter chip per category, and nothing else — "All" is their union.
  const categories=parseRows(categorySchema,result.skillCategories,'skillCategories',[]);
  const groups:Record<string,string[]>=Object.fromEntries(categories.filter(category=>category.tools.length).map(category=>[category.title,category.tools]));

  // A half-filled about document keeps the reviewed copy rather than blanking the section.
  const about=aboutSchema.safeParse(stripNulls(result.about));

  return{
   ...fallback,
   settings:about.success?{...settings,statementHeading:about.data.heading,statement:about.data.statement,statementNote:about.data.note??''}:settings,
   projects:parseRows(projectSchema,result.projects,'projects',projects as Project[]) as Project[],
   stats:Array.isArray(result.stats)&&result.stats.length?result.stats:stats,
   journey:parseRows(entrySchema,result.journey,'experience',journey),
   education:parseRows(entrySchema,result.education,'education',education),
   skillGroups:Object.keys(groups).length?groups:skillGroups,
   achievements:parseRows(achievementSchema,result.achievements,'achievements',achievements),
   faqs:parseRows(faqSchema,result.faqs,'chatFaqs',chatFaqs),
  };
 }catch(error){console.warn('CMS content unavailable; serving reviewed fallback.',error instanceof Error?error.message:error);return fallback;}
}
