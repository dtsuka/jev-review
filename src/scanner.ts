import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';

const DEFAULT_EXTENSIONS = [
  'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'mts', 'cts',
  'py', 'php', 'rb', 'go', 'rs', 'java', 'kt', 'kts', 'cs',
  'vue', 'svelte', 'astro', 'css', 'scss', 'sql', 'sh',
  'patch', 'diff',
];
const IGNORE = ['**/node_modules/**','**/.git/**','**/dist/**','**/build/**','**/.next/**','**/.nuxt/**','**/.output/**','**/coverage/**','**/vendor/**','**/.venv/**','**/venv/**','**/.jev-review/**','**/*.min.js','**/*.map'];

export async function collectFiles(root:string):Promise<string[]>{const pattern=`**/*.{${DEFAULT_EXTENSIONS.join(',')}}`;return globby(pattern,{cwd:root,absolute:true,onlyFiles:true,unique:true,dot:false,ignore:IGNORE,gitignore:true});}
export async function readSource(file:string):Promise<string>{return readFile(file,'utf8');}
export function relativeFile(root:string,file:string):string{return path.relative(root,file).split(path.sep).join('/');}
export function isPatchFile(file:string):boolean{return /\.(patch|diff)$/i.test(file);}

export interface SourceChunk { index:number; total:number; startLine:number; endLine:number; content:string; kind:'source'|'diff'; }

/** Split source without silently dropping the tail. Diff files prefer file/hunk boundaries. */
export function chunkSource(file:string,text:string,maxChars=24_000):SourceChunk[]{
  const parts=isPatchFile(file)?splitDiff(text,maxChars):splitLines(text,maxChars); const total=parts.length;
  return parts.map((p,index)=>({index,total,startLine:p.startLine,endLine:p.endLine,content:p.content,kind:isPatchFile(file)?'diff':'source'}));
}

type Part={startLine:number;endLine:number;content:string};
function splitLines(text:string,maxChars:number):Part[]{
  const lines=text.split('\n'); const out:Part[]=[]; let start=0; let buf:string[]=[]; let chars=0;
  const flush=()=>{if(!buf.length)return;out.push({startLine:start+1,endLine:start+buf.length,content:buf.join('\n')});start+=buf.length;buf=[];chars=0;};
  for(const line of lines){const size=line.length+1;if(buf.length&&chars+size>maxChars)flush();if(!buf.length&&size>maxChars){for(let i=0;i<line.length;i+=maxChars)out.push({startLine:start+1,endLine:start+1,content:line.slice(i,i+maxChars)});start++;continue;}buf.push(line);chars+=size;} flush(); return out.length?out:[{startLine:1,endLine:1,content:''}];
}
function splitDiff(text:string,maxChars:number):Part[]{
  const lines=text.split('\n'); const sections:Part[]=[]; let start=0; let buf:string[]=[];
  const flush=()=>{if(!buf.length)return;sections.push({startLine:start+1,endLine:start+buf.length,content:buf.join('\n')});start+=buf.length;buf=[];};
  for(const line of lines){const boundary=(line.startsWith('diff --git ')||line.startsWith('@@ '))&&buf.length>0;if(boundary)flush();buf.push(line);}flush();
  const out:Part[]=[]; for(const section of sections){if(section.content.length<=maxChars){out.push(section);continue;}const sub=splitLines(section.content,maxChars);for(const p of sub)out.push({startLine:section.startLine+p.startLine-1,endLine:section.startLine+p.endLine-1,content:p.content});}return out;
}
