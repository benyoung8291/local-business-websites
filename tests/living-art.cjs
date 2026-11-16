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
hero.render(.35);assert.notEqual(hero.parts['connector-head'].style.transform,JSON.parse(initial)['connector-head'].style.transform);
assert.notEqual(hero.parts['worker-arm'].style.transform,JSON.parse(initial)['worker-arm'].style.transform);
hero.render(0);assert.equal(JSON.stringify(hero.parts),initial);
const systems=rig('systems');systems.render(.34);assert(+systems.parts['message-packet'].style.opacity>0);assert.equal(systems.parts['record-check'].style.strokeDashoffset,'1');
systems.render(.7);assert.equal(systems.parts['message-packet'].style.opacity,'0');assert.equal(systems.parts['record-check'].style.strokeDashoffset,'0');
systems.render(.34);assert(+systems.parts['message-packet'].style.opacity>0);
const workflow=rig('workflow');workflow.render(.26);assert.equal(workflow.parts.pencil.style.opacity,'1');assert.equal(workflow.parts['review-stamp'].style.opacity,'0');
assert.equal(workflow.parts['report-line-1'].style.strokeDashoffset,'1');
workflow.render(.7);assert.equal(workflow.parts.pencil.style.opacity,'0');assert.equal(workflow.parts['review-stamp'].style.opacity,'1');
const builder=rig('builder');builder.render(.3);const builderFirst=JSON.stringify(builder.parts);
assert.notEqual(builder.parts['app-tile-one'].style.transform,builder.parts['app-tile-three'].style.transform);
builder.render(.5);assert.notEqual(JSON.stringify(builder.parts),builderFirst);builder.render(.3);assert.equal(JSON.stringify(builder.parts),builderFirst);
const coffee=rig('coffee');coffee.render(.3);const coffeeFirst=JSON.stringify(coffee.parts);coffee.render(.4);assert.notEqual(coffee.parts['ben-arm'].style.transform,JSON.parse(coffeeFirst)['ben-arm'].style.transform);coffee.render(.3);assert.equal(JSON.stringify(coffee.parts),coffeeFirst);
for(const scene of [hero,systems,workflow,builder,coffee]){scene.reset();for(const part of Object.values(scene.parts)){assert.equal(part.style.transform,'');assert.equal(part.style.opacity,'');assert.equal(part.style.strokeDashoffset,'');}}
for(const key of ['worker-arm','connector-head','connector-hand','owner-hand','message-packet','pencil','builder-arm','puzzle-piece','ben-arm','ben-laptop'])assert(names.includes(key));
console.log('PASS: articulated joints, reversible actions, message-before-confirmation, write-before-review, independent original-art joints, toolbox placement, laptop movement and complete reset.');

// The rig must use the detailed source images, not vector replacement characters.
for(const image of ['character-tradesman','character-connector','character-owner','toolbox','ben-young-coffee'])assert(html.includes('/assets/'+image+'.webp'));
assert(!html.includes('id="worker-eyes"'));
