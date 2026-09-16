export const shapeNames=['wordmark','quote','bars','grid','helix','sphere','chat','envelope','404','brain'] as const;
export type ShapeName=typeof shapeNames[number];
export function bakeShape(name:ShapeName,count:number):Float32Array {
 const result=new Float32Array(count*4);let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const pixels:number[]=[];
 if(['wordmark','quote','404'].includes(name)&&typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1000;c.height=400;const ctx=c.getContext('2d')!;ctx.fillStyle='white';ctx.textAlign='center';ctx.font='700 140px Inter, sans-serif';if(name==='wordmark'){ctx.fillText('MONISH',500,165);ctx.fillText('PATALAY',500,320);}else ctx.fillText(name==='quote'?'“':'404',500,270);const data=ctx.getImageData(0,0,1000,400).data;for(let y=0;y<400;y+=2)for(let x=0;x<1000;x+=2)if(data[(y*1000+x)*4+3]>100)pixels.push(x,y);}
 for(let i=0;i<count;i++){const a=random()*Math.PI*2,t=i/count;let x=0,y=0,z=(random()-.5)*.12;
 if(pixels.length){const j=Math.floor(random()*pixels.length/2)*2;x=(pixels[j]/1000-.5)*6;y=(.5-pixels[j+1]/400)*2.4;}
 else if(name==='helix'){x=Math.cos(t*30)*1.2;y=(t-.5)*5;z=Math.sin(t*30);}
 else if(name==='sphere'||name==='brain'){const phi=Math.acos(1-2*t),theta=Math.PI*(1+Math.sqrt(5))*i;x=Math.sin(phi)*Math.cos(theta)*2;y=Math.cos(phi)*2;z=Math.sin(phi)*Math.sin(theta);if(name==='brain'){x*=.8;y*=.9;z*=.5;x+=Math.sin(y*10)*.13;}}
 else if(name==='bars'){const col=i%5;x=(col-2)*.75+random()*.5;y=-1.5+random()*(col*.55+.6);}
 else if(name==='grid'){const col=i%3,row=Math.floor(i/3)%2;x=(col-1)*1.7+(random()-.5)*1.45;y=(row-.5)*1.55+(random()-.5)*1.25;}
 else if(name==='envelope'){const edge=i%5,u=random();if(edge<2){x=(u-.5)*4;y=edge===0?-1.2:1.2;}else if(edge<4){x=edge===2?-2:2;y=(u-.5)*2.4;}else{x=(u-.5)*4;y=Math.abs(x)*.7-.2;}}
 else if(name==='chat'){x=Math.cos(a)*2;y=Math.sin(a)*1.35;if(i%6===0){x=-1.1-random()*.5;y=-.8-random()*.8;}}
 else{x=Math.cos(a)*random()*2;y=Math.sin(a)*random()*2;}
 result[i*4]=x;result[i*4+1]=y;result[i*4+2]=z;result[i*4+3]=random();}
 return result;
}
