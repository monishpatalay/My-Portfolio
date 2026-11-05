/* eslint-disable react-hooks/immutability */
'use client';
import {useMemo,useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';

// The hero name as machined plates. Hovering a letter tears that letter apart; leaving it snaps it
// back. Lives inside the particle canvas so it shares its camera, pointer and motion governor.
const GLYPHS:Record<string,string[]>={M:['10001','11011','10101','10101','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],N:['10001','11001','10101','10011','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],S:['01111','10000','10000','01110','00001','00001','11110'],H:['10001','10001','10001','11111','10001','10001','10001'],P:['11110','10001','10001','11110','10000','10000','10000'],A:['01110','10001','10001','11111','10001','10001','10001'],T:['11111','00100','00100','00100','00100','00100','00100'],L:['10000','10000','10000','10000','10000','10000','11111'],Y:['10001','10001','01010','00100','00100','00100','00100']};
const ADV=6.4;// letter advance in bitmap cells
const ROWS:[string,number][]=[['MONISH',4.6],['PATALAY',-4.6]];
// One cell in world units: PATALAY spans about the width the particle wordmark's text did.
export const NAME_SCALE=4/(7*ADV-1.4);
const IDLE_AFTER=4;// seconds without pointer movement before the teaser starts tearing letters

type Letter={i:number;x0:number;x1:number;y0:number;y1:number;cx:number;cy:number;active:boolean;glow:number;plates:Plate[]};
type Plate={L:Letter;hx:number;hy:number;ex:number;ey:number;ez:number;axis:THREE.Vector3;ang:number;s:number;v:number;k:number;base:THREE.Color;hot:boolean};

function build(){
 let seed=26;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const letters:Letter[]=[],plates:Plate[]=[];
 for(const [word,cy] of ROWS){
  const x0=-(word.length*ADV-1.4)/2,top=cy+3.5;
  [...word].forEach((ch,i)=>{
   const lx=x0+i*ADV,L:Letter={i:letters.length,x0:lx,x1:lx+5,y0:top-7,y1:top,cx:lx+2.5,cy,active:false,glow:0,plates:[]};
   letters.push(L);
   GLYPHS[ch].forEach((row,ry)=>[...row].forEach((bit,c)=>{
    if(bit!=='1')return;
    const hx=lx+c+.5,hy=top-ry-.5,dx=hx-L.cx+(rand()-.5)*2.5,dy=hy-L.cy+(rand()-.5)*2.5,len=Math.hypot(dx,dy)||1,d=1.8+rand()*2.7;
    const p:Plate={L,hx,hy,ex:dx/len*d,ey:dy/len*d,ez:1.5+rand()*4,axis:new THREE.Vector3(rand()-.5,rand()-.5,rand()-.5).normalize(),
     ang:(2+rand()*4)*(rand()<.5?-1:1),s:0,v:0,k:140+rand()*100,base:new THREE.Color(rand()<.2?'#4A3F62':'#3A3150'),hot:rand()<.22};
    plates.push(p);L.plates.push(p);
   }));
  });
 }
 return {letters,plates};
}

export default function TeardownName({pointer,visible,calm}:{pointer:RefObject<{x:number;y:number}>;visible:boolean;calm:boolean}){
 const {letters,plates}=useMemo(()=>build(),[]);
 const geometry=useMemo(()=>new THREE.BoxGeometry(.86,.86,.34),[]);
 const material=useMemo(()=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:.35,transparent:true,opacity:0}),[]);
 const mesh=useRef<THREE.InstancedMesh>(null),group=useRef<THREE.Group>(null);
 const st=useRef({prev:0,presence:0,lastMove:0,px:NaN,py:NaN,shake:0});
 const tmp=useMemo(()=>({m:new THREE.Matrix4(),q:new THREE.Quaternion(),p:new THREE.Vector3(),s:new THREE.Vector3(),c:new THREE.Color(),hot:new THREE.Color('#7C5CFF'),lit:new THREE.Color('#A893FF')}),[]);

 // Tearing a letter kicks its neighbours, which wobble back on their own springs.
 const tear=(L:Letter)=>{
  st.current.shake=1.3;
  for(const N of letters){
   if(N===L)continue;
   const dx=Math.abs(N.cx-L.cx),kick=N.cy===L.cy?(dx<ADV*1.5?3.4:dx<ADV*2.5?1.5:0):(dx<ADV*1.2?1.8:0);
   if(kick)for(const p of N.plates)p.v+=kick*(.5+Math.random());
  }
 };

 useFrame(()=>{
  const m=mesh.current,g=group.current,s=st.current;if(!m||!g)return;
  const now=performance.now()/1000;if(!s.prev){s.prev=now;s.lastMove=now;}
  const dt=Math.min(now-s.prev,1/30);s.prev=now;
  s.presence+=((visible?1:0)-s.presence)*Math.min(1,dt*6);
  m.visible=s.presence>.01;if(!m.visible)return;

  const {x,y}=pointer.current;if(x!==s.px||y!==s.py){s.px=x;s.py=y;s.lastMove=now;}
  let active=-1;
  if(visible&&!calm){
   const lx=x/NAME_SCALE,ly=y/NAME_SCALE;
   const hit=letters.find(L=>lx>L.x0-.6&&lx<L.x1+.6&&ly>L.y0-.6&&ly<L.y1+.6);
   active=hit?hit.i:-1;
   const idle=now-s.lastMove-IDLE_AFTER;
   if(active<0&&idle>0&&idle%1.1<.55)active=Math.floor(idle/1.1)%letters.length;
  }
  for(const L of letters){
   const was=L.active;L.active=L.i===active;
   if(L.active&&!was)tear(L);else if(!L.active&&was)s.shake=Math.max(s.shake,.5);
   L.glow+=((L.active?1:0)-L.glow)*Math.min(1,dt*12);
  }

  plates.forEach((p,i)=>{
   // Spring: soft on the way out, stiff and underdamped on the way back for a mechanical snap.
   const T=p.L.active?1:0,k=T?p.k:p.k*2.2,c=2*Math.sqrt(k)*(T?.8:.5);
   p.v+=(k*(T-p.s)-c*p.v)*dt;p.s+=p.v*dt;if(p.s<-.12){p.s=-.12;p.v=0;}
   tmp.p.set(p.hx+p.ex*p.s,p.hy+p.ey*p.s,p.ez*Math.max(0,p.s));
   tmp.q.setFromAxisAngle(p.axis,p.ang*p.s);
   m.setMatrixAt(i,tmp.m.compose(tmp.p,tmp.q,tmp.s.setScalar(s.presence)));
   m.setColorAt(i,tmp.c.copy(p.hot?tmp.hot:p.base).lerp(tmp.lit,p.L.glow*.85));
  });
  m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;
  material.opacity=s.presence;
  g.position.set((Math.random()-.5)*s.shake*NAME_SCALE,(Math.random()-.5)*s.shake*NAME_SCALE,0);s.shake*=.88;
 });

 return <group ref={group}>
  <ambientLight color="#8a80a8" intensity={.6*Math.PI}/>
  <directionalLight position={[-1.6,2.2,3]} intensity={1.05*Math.PI}/>
  <pointLight color="#7c5cff" position={[0,0,1.9]} intensity={2.2*Math.PI} distance={10} decay={0}/>
  <group scale={NAME_SCALE}><instancedMesh ref={mesh} args={[geometry,material,plates.length]} frustumCulled={false}/></group>
 </group>;
}
