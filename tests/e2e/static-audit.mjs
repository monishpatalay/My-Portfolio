import {readFile, readdir, stat, writeFile} from 'node:fs/promises';
const root=new URL('../../',import.meta.url);
const source=await readFile(new URL('lib/content/data.ts',root),'utf8');
const urls=[...new Set(source.match(/https:\/\/[^'"\s]+/g))];
const links=await Promise.all(urls.map(async url=>{
  try {const r=await fetch(url,{signal:AbortSignal.timeout(30000)}); const body=Buffer.from(await r.arrayBuffer()); return {url,finalURL:r.url,status:r.status,bytes:body.length,pdf:body.subarray(0,5).toString()==='%PDF-',result:r.status<400?'PASS':url.includes('linkedin.com')&&[403,999].includes(r.status)?'MANUAL':'FAIL'};}
  catch(error){return {url,result:'MANUAL',error:error.message};}
}));
async function files(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(async e=>e.isDirectory()?files(new URL(`${e.name}/`,dir)):[{path:new URL(e.name,dir).pathname,bytes:(await stat(new URL(e.name,dir))).size}]))).flat();}
const assets=await files(new URL('public/',root));
const result={date:new Date().toISOString(),scope:'Fallback source URLs only; current CMS/rendered links require production browser crawl.',links,assets,over1MB:assets.filter(a=>a.bytes>1_000_000)};
await writeFile(new URL('tests/e2e/artifacts/static-audit.json',root),JSON.stringify(result,null,2));
console.log(JSON.stringify({links,assets:assets.length,over1MB:result.over1MB},null,2));
