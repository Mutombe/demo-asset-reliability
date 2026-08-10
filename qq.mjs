import puppeteer from 'file:///C:/Users/PC/documents/leadrefiv2/data/generated/asset-reliability/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const OUT='C:/Users/PC/AppData/Local/Temp/claude/C--Users-PC-documents-leadrefiv2/ccad1e8a-1fff-46e9-9767-450a8d8a7795/scratchpad';
const b=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:'new',args:['--no-sandbox']});
const p=await b.newPage(); await p.setViewport({width:390,height:844});
await p.goto('http://localhost:4932/',{waitUntil:'networkidle2',timeout:30000}); await new Promise(r=>setTimeout(r,1200));
const hero=await p.evaluate(()=>{const h=document.querySelector('section');const ctas=[...h.querySelectorAll('a,button')];const lastBottom=ctas.length?Math.max(...ctas.map(c=>c.getBoundingClientRect().bottom)):0;return {heroBottom:Math.round(h.getBoundingClientRect().bottom),lastCta:Math.round(lastBottom),ov:document.documentElement.scrollWidth-window.innerWidth};});
console.log('MOBILE HERO heroBottom='+hero.heroBottom+' lastCTA='+hero.lastCta+' vp=844 ov='+hero.ov+' fits='+(hero.heroBottom<=850));
await p.screenshot({path:`${OUT}/ars-mobhero.png`});
await p.setViewport({width:1440,height:1000});
await p.goto('http://localhost:4932/insights',{waitUntil:'networkidle2'}); await new Promise(r=>setTimeout(r,1200));
const ins=await p.evaluate(()=>({iframes:document.querySelectorAll('iframe[src*="youtube"]').length,ids:[...document.querySelectorAll('iframe[src*="youtube"]')].map(i=>(i.src.match(/embed\/([^?]+)/)||[])[1]),links:document.querySelectorAll('a[class*=dotted]').length}));
console.log('INSIGHTS yt-iframes='+ins.iframes+' ids='+JSON.stringify(ins.ids)+' bodyLinks(dotted)='+ins.links);
await p.screenshot({path:`${OUT}/ars-insights.png`});
let bad=0; for(const path of ['/','/services','/products','/insights','/about','/contact']){for(const w of [1440,390]){await p.setViewport({width:w,height:844});await p.goto('http://localhost:4932'+path,{waitUntil:'networkidle2'});await new Promise(r=>setTimeout(r,350));const ov=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(ov>1){bad++;console.log('OVERFLOW',path,w,ov);}}}
console.log(bad?('FAIL '+bad):'0 overflow all key pages 1440+390');
await b.close();
