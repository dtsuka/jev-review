import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

type Verdict='true_positive'|'false_positive';
type Finding={file:string;category:string;verdict?:Verdict};
type Verified={findings:Finding[]};
type BaselineFinding={file:string;category:string;severity?:string;problem?:string};
type Baseline={findings:BaselineFinding[]};
type Report={files:{file:string;scores:Record<string,number>}[];thresholds:Record<string,number>};
const root=path.resolve(process.argv[2]??'.');const dir=path.join(root,'.jev-review');
const report:Report=JSON.parse(await readFile(path.join(dir,'report.json'),'utf8'));const verified:Verified=JSON.parse(await readFile(path.join(dir,'verified-report.json'),'utf8'));const baseline:Baseline=JSON.parse(await readFile(path.join(dir,'baseline-report.json'),'utf8'));
const flaggedFiles=new Set(report.files.filter(f=>Object.entries(f.scores).some(([c,s])=>s>=(report.thresholds[c]??1))).map(f=>f.file));
const baselineFiles=new Set(baseline.findings.map(f=>f.file));const retained=baseline.findings.filter(f=>flaggedFiles.has(f.file));const missed=baseline.findings.filter(f=>!flaggedFiles.has(f.file));
const verifiedTp=verified.findings.filter(f=>f.verdict==='true_positive').length;const verifiedFp=verified.findings.filter(f=>f.verdict==='false_positive').length;
const totalFiles=report.files.length;const selectedFiles=flaggedFiles.size;const fileReduction=totalFiles?1-selectedFiles/totalFiles:0;const issueRetention=baseline.findings.length?retained.length/baseline.findings.length:1;
const result={generatedAt:new Date().toISOString(),files:{total:totalFiles,selected:selectedFiles,reduction:fileReduction},triage:{verifiedTruePositives:verifiedTp,verifiedFalsePositives:verifiedFp,precision:verifiedTp+verifiedFp?verifiedTp/(verifiedTp+verifiedFp):null},baseline:{issues:baseline.findings.length,filesWithIssues:baselineFiles.size,retainedIssues:retained.length,missedIssues:missed.length,issueRetention},costProxy:{description:'File-count proxy only; replace with measured tokens/cost when available.',fullReviewUnits:totalFiles,jevSecondPassUnits:selectedFiles,secondPassReduction:fileReduction},missed};
await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'evaluation.json'),JSON.stringify(result,null,2)+'\n');
const pct=(n:number)=>`${(n*100).toFixed(1)}%`;console.log(`Files sent to deep review: ${selectedFiles}/${totalFiles} (${pct(1-fileReduction)})`);console.log(`Deep-review file reduction: ${pct(fileReduction)}`);console.log(`Verified triage precision: ${result.triage.precision===null?'n/a':pct(result.triage.precision)}`);console.log(`Baseline issues retained: ${retained.length}/${baseline.findings.length} (${pct(issueRetention)})`);console.log(`Baseline issues missed: ${missed.length}`);console.log('Evaluation: .jev-review/evaluation.json');
