import {ImageResponse} from 'next/og';
import {getContent} from '@/lib/content/server';
export const alt='Case study by Monish Patalay';
export const size={width:1200,height:630};
export const contentType='image/png';
// Same palette as app/opengraph-image.tsx; the project cover sits on the right when it has one.
export default async function Image({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const {projects}=await getContent();const p=projects.find(project=>project.slug===slug);return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',gap:48,background:'#0b080c',color:'#f5f5f7',padding:80}}><div style={{display:'flex',flexDirection:'column',flex:1}}><div style={{fontSize:22,color:'#c2a4ff',letterSpacing:2}}>CASE STUDY</div><div style={{fontSize:p&&p.title.length>18?62:84,letterSpacing:-3,marginTop:28,lineHeight:1.05}}>{p?.title??'Monish Patalay'}</div>{p&&<div style={{fontSize:26,marginTop:28,color:'#b5a6c6'}}>{p.techs.slice(0,4).join(' · ')}</div>}<div style={{fontSize:20,marginTop:60}}>Monish Patalay · monishpatalay.dev</div></div>{p?.image&&<img src={`${p.image}?w=1040&h=585&fit=crop&fm=jpg`} width={520} height={293} alt="" style={{borderRadius:24,objectFit:'cover'}}/>}</div>,size);}
