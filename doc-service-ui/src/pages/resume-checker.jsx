import { useRef, useState } from 'react';
import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import PdfViewer from '../components/ai/PdfViewer';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();
const styles = { repetition: 'bg-red-200', buzzwords: 'bg-amber-200', readability: 'bg-blue-200', growth: 'bg-emerald-200' };
const buzzwords = ['results-driven', 'team player', 'hardworking', 'dynamic', 'responsible for'];

async function textFromFile(file) {
  if (/\.docx$/i.test(file.name)) return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  return (await Promise.all(Array.from({ length: pdf.numPages }, async (_, i) => (await (await pdf.getPage(i + 1)).getTextContent()).items.map(x => x.str).join(' ')))).join('\n\n');
}
function analyze(text, jd) {
  const count = {}; (text.match(/\b[a-z-]{3,}\b/gi) || []).forEach(w => { count[w.toLowerCase()] = (count[w.toLowerCase()] || 0) + 1; });
  const issues = Object.entries(count).filter(([w, n]) => n >= 3 && ['developed','built','implemented','managed','created','designed'].includes(w)).map(([phrase, count]) => ({ category: 'repetition', phrase, count, suggestion: 'Replace this action verb with a more specific verb.' }));
  buzzwords.filter(w => text.toLowerCase().includes(w)).forEach(phrase => issues.push({ category: 'buzzwords', phrase, count: 1, suggestion: 'Replace this with a measurable achievement.' }));
  text.split(/(?<=[.!?])\s+/).filter(s => s.length > 220).forEach(phrase => issues.push({ category: 'readability', phrase, count: 1, suggestion: 'Split this into two concise bullet points.' }));
  if (!/\b\d+[+%]?\b/.test(text)) issues.push({ category: 'growth', phrase: '', count: 1, suggestion: 'Add numbers to demonstrate impact and scale.' });
  const terms = (jd.match(/\b[a-z+#.]{3,}\b/gi) || []).map(x => x.toLowerCase());
  return { issues, fit: terms.length ? Math.round(100 * terms.filter(x => text.toLowerCase().includes(x)).length / terms.length) : null };
}
export default function ResumeCheckerPage() {
  const input = useRef(); const [file,setFile]=useState(); const [text,setText]=useState(''); const [jd,setJd]=useState(''); const [data,setData]=useState(); const [active,setActive]=useState(); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
  const upload=async f=>{ if(!f)return; if(!/\.(pdf|docx)$/i.test(f.name)){setError('Upload a PDF or DOCX.');return;} setLoading(true);setError('');try{setFile(f);setText(await textFromFile(f));}catch{setError('Unable to read this document.');}finally{setLoading(false);}};
  const issue=data?.issues[active]; const chunks=issue?.phrase ? text.split(new RegExp(`(${issue.phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'ig')) : [text];
  const apply=()=>{setText(text.replace(issue.phrase,issue.suggestion));setData(d=>({...d,issues:d.issues.filter((_,i)=>i!==active)}));setActive();};
  const isPdf = /\.pdf$/i.test(file?.name || '');
  return <><div className="relative overflow-hidden border-b border-black/50 home-page-hero-bg" style={{backgroundImage:"url('/assest/home_page.png')"}}><Navbar/><PageHero breadcrumb="Resume Analyzer" title="See exactly what to improve" description="PDF and DOCX files are processed locally in your browser."/></div><main className="mx-auto max-w-7xl p-6">{!data?<div className="mx-auto max-w-2xl rounded-2xl border bg-white p-7 text-slate-900"><input ref={input} className="hidden" type="file" accept=".pdf,.docx" onChange={e=>upload(e.target.files?.[0])}/><button onClick={()=>input.current.click()} className="w-full rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-10 text-violet-800"><b>Upload your resume</b><br/><span className="text-sm">PDF or DOCX · never sent to the server</span></button>{file&&<p className="mt-3 text-center text-sm">{file.name}</p>}{loading&&<p className="mt-3 text-center">Reading document…</p>}{error&&<p className="mt-3 text-center text-red-600">{error}</p>}{text&&<><textarea className="mt-6 w-full rounded-lg border p-3" rows="5" value={jd} onChange={e=>setJd(e.target.value)} placeholder="Optional: paste job description"/><button className="mt-4 w-full rounded-lg bg-violet-600 p-3 font-bold text-white" onClick={()=>setData(analyze(text,jd))}>Analyze resume</button></>}</div>:<div className="grid gap-5 lg:grid-cols-[240px_1fr_320px]"><aside className="rounded-xl border bg-white p-4 text-slate-900"><b>Top fixes</b>{['repetition','growth','buzzwords','readability'].map(c=>{const n=data.issues.filter(x=>x.category===c).length;return <button disabled={!n} onClick={()=>setActive(data.issues.findIndex(x=>x.category===c))} className="mt-2 flex w-full justify-between rounded p-2 text-left hover:bg-slate-100">{c}<span>{n}</span></button>})}{data.fit!=null&&<p className="mt-5 rounded bg-blue-50 p-3">Job fit: <b>{data.fit}%</b></p>}</aside>{isPdf?<PdfViewer file={file} activePhrase={issue?.phrase} activeCategory={issue?.category}/>:<article className="min-h-[700px] whitespace-pre-wrap rounded-xl border bg-white p-7 font-serif leading-7 text-slate-900">{chunks.map((c,i)=>issue&&c.toLowerCase()===issue.phrase.toLowerCase()?<mark key={i} className={styles[issue.category]}>{c}</mark>:c)}</article>}<aside className="rounded-xl border bg-white p-5 text-slate-900">{issue?<><p className="font-bold capitalize">{issue.category}</p><p className="mt-3 text-sm text-slate-600">{issue.suggestion}</p>{issue.phrase&&<button onClick={apply} className="mt-5 rounded bg-violet-600 px-4 py-2 text-white">Apply in preview</button>}</>:<p>Select a report to highlight its text and see the suggestion.</p>}<button onClick={()=>setData()} className="mt-8 text-sm text-violet-700">Analyze another file</button></aside></div>}</main></>;
}
