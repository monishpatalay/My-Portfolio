export const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
export function horizontalDelta(x:number,y:number,target:number,start:number,end:number,height:number):number|null {
 if(target<start-height*.25||target>end||Math.abs(x)<=Math.abs(y)) return null;
 const room=clamp(x,target<start?0:start-target,end-target);
 return Math.sign(room)===Math.sign(x)?room:0;
}
export function railStops(offsets:number[],padding:number,max:number){return [...new Set(offsets.map(offset=>clamp(offset-padding,0,Math.max(0,max))))];}
export function nearestStop(stops:number[],value:number){return stops.reduce((best,current,index)=>Math.abs(current-value)<Math.abs(stops[best]-value)?index:best,0);}
