import {ImageResponse} from 'next/og';
export const alt='Monish Patalay — AI Engineer & Full-Stack Developer';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',background:'#0b080c',color:'#f5f5f7',padding:90}}><div style={{fontSize:22,color:'#c2a4ff',marginBottom:35}}>Thoughtful engineering. Useful AI.</div><div style={{fontSize:100,letterSpacing:-6}}>Monish Patalay.</div><div style={{fontSize:28,marginTop:35,color:'#b5a6c6'}}>AI Engineer · Full-Stack Developer</div><div style={{fontSize:18,marginTop:65}}>monishpatalay.dev</div></div>,size);}
