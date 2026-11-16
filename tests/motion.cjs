const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('dist/assets/motion.js','utf8');
function setup(reduced=false){
 let top=450, pending=null, mediaChange;
 const events={}, classes=new Set(),sprites=Array.from({length:3},()=>({style:{}}));
 const stage={querySelectorAll:()=>sprites,getBoundingClientRect:()=>({top,bottom:top+440,height:440})};
 const sceneImage={style:{}},scene={dataset:{characterScene:'toolbox'},querySelector:()=>sceneImage,getBoundingClientRect:()=>({top,bottom:top+440,height:440})};
 const toggle={setAttribute(k,v){this[k]=v},addEventListener(_,f){this.click=f}};
 const media={matches:reduced,addEventListener(_,fn){mediaChange=fn}};
 const ctx={innerHeight:800,innerWidth:1200,requestAnimationFrame:f=>{pending=f;return 1},cancelAnimationFrame:()=>{pending=null},window:{matchMedia:()=>media,addEventListener:(name,fn)=>events[name]=fn},document:{hidden:false,documentElement:{classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}},querySelector:s=>s==='#motion-toggle'?toggle:stage,querySelectorAll:()=>[scene],addEventListener(){}}};
 vm.runInNewContext(code,ctx);
 const flush=()=>{const fn=pending;pending=null;fn?.()};flush();
 return {sprites,sceneImage,toggle,classes,scroll(y){top=y;events.scroll();flush()},preference(matches){media.matches=matches;mediaChange({matches});flush()},flush};
}
const a=setup(), initial=a.sprites.map(s=>s.style.transform),initialScene=a.sceneImage.style.transform;
a.scroll(100);assert(a.sprites.every((s,i)=>s.style.transform!==initial[i]));assert.notEqual(a.sceneImage.style.transform,initialScene);
assert.equal(new Set(a.sprites.map(s=>s.style.transform)).size,3);
a.scroll(450);assert.deepEqual(a.sprites.map(s=>s.style.transform),initial);
a.toggle.click();assert(a.sprites.every(s=>s.style.transform===''));a.scroll(50);assert(a.sprites.every(s=>s.style.transform===''));
a.toggle.click();a.flush();assert(a.sprites.every(s=>s.style.transform));
a.preference(true);assert(a.toggle.disabled);assert(a.sprites.every(s=>s.style.transform===''));a.preference(false);assert(a.sprites.every(s=>s.style.transform));
const b=setup(true);assert(b.sprites.every(s=>s.style.transform===''));assert(b.toggle.disabled);
console.log('PASS: independent scroll motion, exact reversal, secondary character movement, pause/resume and reduced-motion changes.');
