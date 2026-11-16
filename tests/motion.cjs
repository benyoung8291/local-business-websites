const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('dist/assets/motion.js','utf8');
function setup(reduced=false){
 let top=450, pending=null, mediaChange;
 const events={}, classes=new Set(),sprites=Array.from({length:3},()=>({style:{}}));
 const stage={querySelectorAll:()=>sprites,getBoundingClientRect:()=>({top,bottom:top+440,height:440})};
 const sceneImage={style:{}},scene={dataset:{characterScene:'toolbox'},querySelector:()=>sceneImage,getBoundingClientRect:()=>({top,bottom:top+440,height:440})};
 const decorations=Array.from({length:5},()=>({style:{}})),line={style:{}},photo={style:{}};
 const portrait={querySelectorAll:()=>decorations,querySelector:()=>line,getBoundingClientRect:()=>({top,bottom:top+400,height:400})};
 const storyParts=['wash','left','right','tick','star'].map(part=>({dataset:{part},style:{}})),trace={style:{}};
 const story={getBoundingClientRect:()=>({top,bottom:top+440,height:440}),querySelectorAll:s=>s==='[data-part]'?storyParts:[trace]};
 const clocks=Array.from({length:2},()=>({style:{setProperty(k,v){this[k]=v},removeProperty(k){delete this[k]}}})),dayLine={style:{}};
 const day={getBoundingClientRect:()=>({top,bottom:top+440,height:440}),querySelector:()=>dayLine,querySelectorAll:s=>s==='.clock-face'?clocks:[]};
 const toggle={setAttribute(k,v){this[k]=v},addEventListener(_,f){this.click=f}};
 const media={matches:reduced,addEventListener(_,fn){mediaChange=fn}};
 const ctx={innerHeight:800,innerWidth:1200,requestAnimationFrame:f=>{pending=f;return 1},cancelAnimationFrame:()=>{pending=null},window:{matchMedia:()=>media,addEventListener:(name,fn)=>events[name]=fn},document:{hidden:false,documentElement:{classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}},querySelector:s=>s==='#motion-toggle'?toggle:s==='[data-portrait-scene]'?portrait:s==='.character-stage'?stage:s==='[data-day-scene]'?day:null,querySelectorAll:s=>s==='[data-character-scene]'?[scene]:s==='[data-story-scene]'?[story]:[],addEventListener(){}}};
 vm.runInNewContext(code,ctx);
 const flush=()=>{const fn=pending;pending=null;fn?.()};flush();
 return {clocks,dayLine,sprites,sceneImage,decorations,line,photo,storyParts,trace,toggle,classes,scroll(y){top=y;events.scroll();flush()},preference(matches){media.matches=matches;mediaChange({matches});flush()},flush};
}
const a=setup(), initial=a.sprites.map(s=>s.style.transform),initialScene=a.sceneImage.style.transform;
a.scroll(100);assert(a.sprites.every((s,i)=>s.style.transform!==initial[i]));assert.notEqual(a.sceneImage.style.transform,initialScene);
assert.equal(new Set(a.sprites.map(s=>s.style.transform)).size,3);
a.scroll(450);assert.deepEqual(a.sprites.map(s=>s.style.transform),initial);
a.toggle.click();assert(a.sprites.every(s=>s.style.transform===''));a.scroll(50);assert(a.sprites.every(s=>s.style.transform===''));
a.toggle.click();a.flush();assert(a.sprites.every(s=>s.style.transform));
a.preference(true);assert(a.toggle.disabled);assert(a.sprites.every(s=>s.style.transform===''));a.preference(false);assert(a.sprites.every(s=>s.style.transform));
const b=setup(true);assert(b.sprites.every(s=>s.style.transform===''));assert(b.toggle.disabled);
const p=setup(),first=p.decorations.map(s=>s.style.transform),firstLine=p.line.style.strokeDashoffset;
p.scroll(100);assert(p.decorations.every((s,i)=>s.style.transform!==first[i]));assert.notEqual(p.line.style.strokeDashoffset,firstLine);assert.equal(p.photo.style.transform,undefined);
p.scroll(450);assert.deepEqual(p.decorations.map(s=>s.style.transform),first);assert.equal(p.line.style.strokeDashoffset,firstLine);
p.toggle.click();p.scroll(100);assert(p.decorations.every(s=>s.style.transform===''));assert.equal(p.line.style.strokeDashoffset,'');
p.preference(true);assert(p.decorations.every(s=>s.style.transform===''));assert.equal(p.line.style.strokeDashoffset,'');
console.log('PASS: portrait layers, reversible line drawing, static photo, portrait pause/reduced-motion.');
console.log('PASS: independent scroll motion, exact reversal, secondary character movement, pause/resume and reduced-motion changes.');

const storyTest=setup(),storyStart=storyTest.storyParts.map(s=>s.style.transform),traceStart=storyTest.trace.style.strokeDashoffset;storyTest.scroll(50);assert(storyTest.storyParts.every((s,i)=>s.style.transform!==storyStart[i]));assert.notEqual(storyTest.trace.style.strokeDashoffset,traceStart);storyTest.scroll(450);assert.deepEqual(storyTest.storyParts.map(s=>s.style.transform),storyStart);storyTest.toggle.click();assert(storyTest.storyParts.every(s=>s.style.transform===''));assert.equal(storyTest.trace.style.strokeDashoffset,'');console.log('PASS: service scene motion, reversible trace and pause.');

const dayTest=setup();
dayTest.scroll(180); // Scene centre aligns with viewport centre: story is complete.
assert.equal(dayTest.dayLine.style.strokeDashoffset,'0.000');
assert.equal(dayTest.clocks[0].style['--hour-angle'],'180deg');
assert.equal(dayTest.clocks[1].style['--hour-angle'],'270deg');
assert.equal(dayTest.clocks[1].style['--minute-angle'],'630deg');
dayTest.scroll(450);assert.notEqual(dayTest.dayLine.style.strokeDashoffset,'0.000');
dayTest.preference(true);assert.equal(dayTest.clocks[1].style['--minute-angle'],undefined);
assert.equal(dayTest.dayLine.style.strokeDashoffset,'');
console.log('PASS: clock story completes at viewport centre, reverses and resets for reduced motion.');
