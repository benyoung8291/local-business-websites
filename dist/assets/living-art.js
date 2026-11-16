/* Each illustration has a reversible story timeline, measured on its stable scene. */
(() => {
  const scenes = [...document.querySelectorAll('[data-live-scene]')].map(element => ({
    element, type: element.dataset.liveScene,
    parts: Object.fromEntries([...element.querySelectorAll('[data-act]')].map(p => [p.dataset.act,p]))
  }));
  const clamp = n => Math.max(0,Math.min(1,n));
  const beat = (p,a,b) => { const t=clamp((p-a)/(b-a)); return t*t*(3-2*t); };
  const wave = (p,a,b,cycles=1) => Math.sin(clamp((p-a)/(b-a))*Math.PI*2*cycles)*Math.sin(clamp((p-a)/(b-a))*Math.PI);
  const turn = (el,angle,x=0,y=0,sx=1,sy=sx) => { if(el) el.style.transform=`translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${angle.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`; };
  const ink = (el,t) => { if(el) el.style.strokeDashoffset=String(1-clamp(t)); };
  const show = (el,t) => { if(el) el.style.opacity=String(clamp(t)); };
  window.BenIllustrations = {
    render() {
      scenes.forEach(({element,type,parts:a}) => {
        const r=element.getBoundingClientRect();
        if(r.bottom < -100 || r.top > innerHeight+100) return;
        const p=type==='hero'
          ? clamp(window.scrollY / Math.max(180,r.top+window.scrollY-120))
          : clamp((innerHeight-r.top)/(innerHeight+r.height));
        if(type==='hero') {
          const connect=beat(p,.24,.52);
          turn(a['worker-arm'],2.2*wave(p,.08,.58,4));
          turn(a['worker-head'],-3*wave(p,.10,.75));
          turn(a['worker-foot'],4*wave(p,.20,.85,2));
          turn(a['connector-head'],3.5*wave(p,.16,.84));
          turn(a['connector-hand'],2.5*wave(p,.24,.78));
          turn(a['connector-foot'],-4*wave(p,.18,.80,1.5));
          ink(a['live-cable'],connect);
          show(a['live-cable'],.6*Math.sin(connect*Math.PI));
          turn(a['owner-head'],-2.6*wave(p,.35,.92));
          turn(a['owner-hand'],3.5*wave(p,.45,.94,2));
          turn(a['owner-foot'],4*wave(p,.32,.94,1.5));
        } else if(type==='systems') {
          const open=beat(p,.13,.27), send=beat(p,.24,.48), settle=beat(p,.48,.60);
          // The envelope opens in place; a note emerges and follows the drawn route.
          turn(a['envelope-flap'],0,0,0,1,1-1.9*open);
          if(a['message-packet'] && a['message-route']) {
            const route=a['message-route']; const pt=route.getPointAtLength(route.getTotalLength()*send);
            turn(a['message-packet'],Math.sin(send*Math.PI)*18,pt.x-150,pt.y-135);
            show(a['message-packet'],beat(p,.20,.26)*(1-beat(p,.48,.52)));
          }
          ['record-one','record-two','record-three'].forEach((k,i)=>ink(a[k],beat(p,.46+i*.025,.53+i*.025)));
          ink(a['record-check'],settle);
        } else if(type==='workflow') {
          const write=beat(p,.12,.36), review=beat(p,.44,.61);
          ink(a['site-writing'],write);
          [1,2,3].forEach(i=>ink(a['report-line-'+i],beat(p,.32+i*.035,.40+i*.035)));
          const t=clamp((p-.12)/.24), row=Math.min(2,Math.floor(t*3)), col=(t*3)%1;
          turn(a['pencil'],Math.sin(t*Math.PI*12)*5,28+col*95,row*33);
          show(a['pencil'],1-beat(p,.37,.42));
          turn(a['review-stamp'],-12*(1-review),0,-40*(1-review),.75+.25*review);
          show(a['review-stamp'],review);
         } else if(type==='coffee') {
          const done=beat(p,.42,.70);
          turn(a['ben-laptop'],1.6*wave(p,.12,.62,3));
          turn(a['ben-arm'],3.2*wave(p,.18,.76,1.5));
          turn(a['ben-head'],-3.5*wave(p,.15,.77));
          turn(a['ben-leg'],4*wave(p,.18,.80,2));
          turn(a['coffee-task'],6*wave(p,.18,.72),0,-18*Math.sin(done*Math.PI));
          turn(a['coffee-note'],-7*wave(p,.15,.75),0,-12*Math.sin(done*Math.PI));
        } else if(type==='builder') {
          const place=beat(p,.19,.55);
          turn(a['builder-arm'],-.8*Math.sin(place*Math.PI),0,3*Math.sin(place*Math.PI));
          turn(a['builder-other-hand'],.8*Math.sin(place*Math.PI),0,3*Math.sin(place*Math.PI));
          turn(a['puzzle-piece'],.8*Math.sin(place*Math.PI),0,3*Math.sin(place*Math.PI));
          turn(a['builder-head'],3.5*wave(p,.16,.76));
          ['app-tile-one','app-tile-two','app-tile-three'].forEach((k,i)=>{
            const t=beat(p,.13+i*.08,.55+i*.06);
            turn(a[k],(i%2 ? -8 : 8)*Math.sin(t*Math.PI),0,-28*Math.sin(t*Math.PI));
          });
        }
      });
    },
    reset() {
      scenes.forEach(({parts})=>Object.values(parts).forEach(el=>{
        el.style.transform='';el.style.opacity='';el.style.strokeDashoffset='';
      }));
    }
  };
})();
