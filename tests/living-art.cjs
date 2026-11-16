const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8');
const names=[...html.matchAll(/data-act="([^"]+)"/g)].map(m=>m[1]);
function rig(type){
 let p=0;
 const parts=Object.fromEntries(names.map(name=>[name,{dataset:{act:name},style:{},getTotalLength:()=>100,getPointAtLength:n=>({x:150+2*n,y:135+n})}]));
 const element={dataset:{liveScene:type},querySelectorAll:()=>Object.values(parts),getBoundingClientRect:()=>type==='hero'?({top:480-ctx.window.scrollY,height:400,bottom:880-ctx.window.scrollY}):({top:800-p*1200,height:400,bottom:1200-p*1200})};
 const ctx={innerHeight:800,window:{scrollY:0},document:{querySelectorAll:()=>[element]}};
 vm.runInNewContext(fs.readFileSync('dist/assets/living-art.js','utf8'),ctx);
 return {parts,ctx,render(n){p=n;if(type==='hero')ctx.window.scrollY=n*360;ctx.window.BenIllustrations.render();},reset(){ctx.window.BenIllustrations.reset();}};
}
const hero=rig('hero');hero.render(0);const initial=JSON.stringify(hero.parts);
hero.render(.6);assert.notEqual(hero.parts['connector-left'].style.transform,JSON.parse(initial)['connector-left'].style.transform);
assert.notEqual(hero.parts['worker-arm'].style.transform,JSON.parse(initial)['worker-arm'].style.transform);
hero.render(0);assert.equal(JSON.stringify(hero.parts),initial);
const systems=rig('systems');systems.render(.34);assert(+systems.parts['message-packet'].style.opacity>0);assert.equal(systems.parts['record-check'].style.strokeDashoffset,'1');
systems.render(.7);assert.equal(systems.parts['message-packet'].style.opacity,'0');assert.equal(systems.parts['record-check'].style.strokeDashoffset,'0');
systems.render(.34);assert(+systems.parts['message-packet'].style.opacity>0);
const workflow=rig('workflow');workflow.render(.26);assert.equal(workflow.parts.pencil.style.opacity,'1');assert.equal(workflow.parts['review-stamp'].style.opacity,'0');
assert.equal(workflow.parts['report-line-1'].style.strokeDashoffset,'1');
workflow.render(.7);assert.equal(workflow.parts.pencil.style.opacity,'0');assert.equal(workflow.parts['review-stamp'].style.opacity,'1');
const builder=rig('builder');builder.render(.3);assert(+builder.parts['app-tile-one'].style.opacity>+builder.parts['app-tile-three'].style.opacity);
builder.render(.7);assert.equal(builder.parts['app-ready'].style.strokeDashoffset,'0');
const coffee=rig('coffee');coffee.render(.3);const typing=coffee.parts['ben-arm'].style.transform;coffee.render(.4);assert.notEqual(coffee.parts['ben-arm'].style.transform,typing);coffee.render(.8);assert.equal(coffee.parts['coffee-check'].style.strokeDashoffset,'0');
for(const scene of [hero,systems,workflow,builder,coffee]){scene.reset();for(const part of Object.values(scene.parts)){assert.equal(part.style.transform,'');assert.equal(part.style.opacity,'');assert.equal(part.style.strokeDashoffset,'');}}
for(const key of ['worker-arm','connector-left','owner-wave','message-packet','pencil','builder-arm','ben-arm'])assert(names.includes(key));
console.log('PASS: articulated joints, reversible actions, message-before-confirmation, write-before-review, staggered app assembly, typing and complete reset.');
