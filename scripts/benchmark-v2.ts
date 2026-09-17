import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHECKS, type CheckName } from '../src/types.js';
import { reviewWithJev } from '../src/jev.js';

type Expected = Record<string, Partial<Record<CheckName, boolean>>>;
type Counts = { tp:number; fp:number; tn:number; fn:number };
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); const fixtureRoot=path.join(root,'fixtures');
const apiKey=process.env.TYPESAFE_API_KEY; if(!apiKey) throw new Error('TYPESAFE_API_KEY is required');
const expected:Expected=JSON.parse(await readFile(path.join(fixtureRoot,'expected-v2.json'),'utf8'));
const results:Record<string,Partial<Record<CheckName,number>>>={};
let done=0;
for(const [file,labels] of Object.entries(expected)){
 const source=await readFile(path.join(fixtureRoot,file),'utf8'); const checks=Object.keys(labels) as CheckName[];
 results[file]=await reviewWithJev({file,source,projectContext:'TypeScript benchmark fixture. Evaluate only the requested risk. Some examples are deliberately subtle and safe examples may resemble vulnerable or buggy code.',checks,apiKey});
 done++; console.log(`[${done}/${Object.keys(expected).length}] ${file} ${checks.map(c=>`${c}=${((results[file][c]??0)*100).toFixed(0)}%`).join(' ')}`);
}
const thresholds=[.3,.4,.5,.6,.7,.8,.9];
function count(check:CheckName,t:number):Counts { const c={tp:0,fp:0,tn:0,fn:0}; for(const [file,labels] of Object.entries(expected)){ if(labels[check]===undefined) continue; const truth=labels[check]===true,pred=(results[file][check]??0)>=t; if(truth&&pred)c.tp++;else if(truth)c.fn++;else if(pred)c.fp++;else c.tn++; } return c; }
const ratio=(n:number,d:number)=>d?n/d:null; const pct=(v:number|null)=>v===null?'  n/a':`${(v*100).toFixed(0).padStart(3)}%`;
const sweep:Record<string,unknown>={}; const recommendations:Partial<Record<CheckName,number>>={};
for(const check of CHECKS){ console.log(`\n${check}`); console.log('threshold precision recall accuracy  TP FP FN TN'); let best:{t:number;p:number}|null=null; const rows=[]; for(const t of thresholds){const c=count(check,t),p=ratio(c.tp,c.tp+c.fp),r=ratio(c.tp,c.tp+c.fn),a=ratio(c.tp+c.tn,c.tp+c.fp+c.tn+c.fn); rows.push({threshold:t,...c,precision:p,recall:r,accuracy:a}); console.log(`${t.toFixed(1).padStart(9)} ${pct(p).padStart(9)} ${pct(r).padStart(6)} ${pct(a).padStart(8)}  ${c.tp}  ${c.fp}  ${c.fn}  ${c.tn}`); if(r!==null&&r>=.9&&p!==null&&(!best||p>best.p||(p===best.p&&t>best.t))) best={t,p}; } sweep[check]=rows; if(best) recommendations[check]=best.t; }
console.log('\nSuggested thresholds (requires recall >= 90%, then maximizes precision):'); for(const check of CHECKS) console.log(`  ${check.padEnd(16)} ${recommendations[check]?.toFixed(1)??'none'}`);
await mkdir(path.join(root,'.jev-review'),{recursive:true}); await writeFile(path.join(root,'.jev-review','benchmark-v2.json'),JSON.stringify({generatedAt:new Date().toISOString(),fixtureCount:Object.keys(expected).length,thresholds,recommendations,sweep,results},null,2));
console.log('\nRaw results: .jev-review/benchmark-v2.json');
