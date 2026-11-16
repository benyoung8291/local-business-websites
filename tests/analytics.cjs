const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('dist/assets/analytics.js','utf8');
function setup(saved, host='www.benjaminyoung.com.au') {
 const handlers={}, appended=[], cookies=[];
 const controls={};
 const element = name => controls[name] ||= {hidden:true,addEventListener:(_,cb)=>handlers[name]=cb,focus(){}};
 const banner=element('banner'); banner.querySelector=s=>element(s); banner.contains=()=>false;
 const doc={title:'Test page',referrer:'https://www.google.com/search?q=private',activeElement:null,
  querySelector:s=>s==='script[data-analytics-id]'?{dataset:{analyticsId:'G-TEST123'}}:s==='#analytics-choice'?banner:element('preferences'),
  addEventListener:(_,cb)=>handlers.document=cb, createElement:()=>({}),head:{appendChild:s=>appended.push(s)}};
 Object.defineProperty(doc,'cookie',{get:()=> '_ga=123; _ga_TEST123=456; essential=yes',set:v=>cookies.push(v)});
 const storage={getItem:()=>saved,setItem:(_,v)=>{saved=v}};
 const context={document:doc,location:{hostname:host,href:`https://${host}/services/?email=private#secret`},URL,localStorage:storage};context.window=context;
 vm.runInNewContext(source,context);
 return {context,handlers,appended,cookies,banner,events:()=>Array.from(context.dataLayer||[],x=>Array.from(x)).filter(x=>x[0]==='event')};
}
let t=setup('declined'); assert.equal(t.appended.length,0);assert.equal(setup().appended.length,1);
assert.equal(t.appended.length,0);t.context.BenAnalytics.track('generate_lead');assert.equal(t.events().length,0);
t.handlers.preferences();assert.equal(t.appended.length,1);assert.equal(t.events().length,1);
assert.equal(t.events()[0][2].page_location,'https://www.benjaminyoung.com.au/services/');assert.equal(t.events()[0][2].page_referrer,'https://www.google.com/search');
assert.equal(t.events().length,1);
t.context.BenAnalytics.track('generate_lead',{email:'secret'});assert.equal(t.events().length,2);assert.ok(!JSON.stringify(t.events()).includes('secret'));
t.context.BenAnalytics.track('private_event','email');t.context.BenAnalytics.track('contact_click','secret');assert.equal(t.events().length,2);
t.handlers.preferences();t.context.BenAnalytics.track('generate_lead');assert.equal(t.events().length,2);assert.equal(t.context['ga-disable-G-TEST123'],true);assert.equal(t.cookies.length,12);assert.ok(t.cookies.every(x=>!x.includes('essential')));
assert.equal(setup('allowed').appended.length,1);assert.equal(setup('declined').appended.length,0);assert.equal(setup('allowed','localhost').appended.length,0);
// Test the real form handler with mocked Formspree responses: no email is sent.
async function submit(ok,throwAnalytics=false) {
 let submitHandler, leads=0,resets=0;
 const button={disabled:false},status={focus(){}};
 const form={action:'https://formspree.io/f/xbgogzjr',addEventListener:(_,cb)=>submitHandler=cb,reportValidity:()=>true,querySelector:()=>button,reset:()=>resets++};
 const ctx={document:{querySelector:s=>s==='#contact-form'?form:s==='#form-status'?status:null},window:{BenAnalytics:{track:()=>{leads++;if(throwAnalytics)throw Error('blocked')}}},fetch:async()=>({ok}),FormData:class{},AbortController,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync('dist/assets/contact.js','utf8'),ctx);await submitHandler({preventDefault(){}});return{leads,resets,status};
}
(async()=>{assert.equal((await submit(false)).leads,0);assert.equal((await submit(true)).leads,1);assert.equal((await submit(true,true)).resets,1);console.log('PASS: default collection, saved opt-out, URL sanitisation, opt-out, event whitelist and successful-enquiry tracking.');})();
