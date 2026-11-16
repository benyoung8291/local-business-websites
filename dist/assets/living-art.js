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
  const eyes = (el,p,at) => turn(el,0,0,0,1,1-.94*Math.pow(Math.max(0,1-Math.abs(p-at)/.022),2));
  window.BenIllustrations = {
    render() {
      scenes.forEach(({element,type,parts:a}) => {
        const r=element.getBoundingClientRect();
        if(r.bottom < -100 || r.top > innerHeight+100) return;
        const p=type==='hero'
          ? clamp(window.scrollY / Math.max(180,r.top+window.scrollY-120))
          : clamp((innerHeight-r.top)/(innerHeight+r.height));
        if(type==='hero') {
          const write=beat(p,.14,.39), connect=beat(p,.26,.49), celebrate=beat(p,.48,.70);
          turn(a['worker-arm'],-8+8*write+4*wave(p,.14,.43,3));
          turn(a['worker-head'],5-9*beat(p,.36,.62));
          turn(a['worker-foot'],8*wave(p,.22,.72,1.5));
          ink(a['worker-ink'],write);
          turn(a['connector-left'],-24*(1-connect));
          turn(a['connector-right'],30*(1-connect));
          turn(a['connector-head'],-7+11*connect-3*celebrate);
          ink(a['live-cable'],beat(p,.47,.62));
          show(a['connection-sparks'],beat(p,.46,.50)*(1-beat(p,.60,.70)));
          turn(a['connection-sparks'],0,0,-8*celebrate,1+.2*celebrate);
          turn(a['owner-wave'],-22*(1-celebrate)+18*wave(p,.48,.86,2));
          turn(a['owner-head'],6-12*celebrate);
          ink(a['owner-check'],beat(p,.54,.65));
          eyes(a['worker-eyes'],p,.46);eyes(a['connector-eyes'],p,.62);eyes(a['owner-eyes'],p,.71);
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
          const typing=beat(p,.14,.48), done=beat(p,.48,.66);
          turn(a['ben-arm'],4*wave(p,.14,.50,4));
          turn(a['ben-head'],5-10*done);
          turn(a['ben-leg'],9*wave(p,.16,.75,1.5));
          ink(a['laptop-code'],typing); ink(a['coffee-check'],done);
          turn(a['coffee-task'],-12*(1-done),0,22*(1-done));
          turn(a['ben-steam'],0,0,-12*beat(p,.15,.70),1,.85+.25*beat(p,.15,.70));
          show(a['ben-steam'],.3+.7*Math.sin(p*Math.PI));
          show(a['coffee-spark'],done); eyes(a['ben-eyes'],p,.62);
        } else if(type==='builder') {
          const build=beat(p,.17,.58);
          turn(a['builder-arm'],-28*wave(p,.16,.61,1.5));
          turn(a['builder-head'],-8+14*build);
          turn(a['builder-leg'],6*wave(p,.25,.75));
          ['app-tile-one','app-tile-two','app-tile-three'].forEach((k,i)=>{
            const t=beat(p,.20+i*.075,.34+i*.075);
            turn(a[k],(-16+i*13)*(1-t),(-70+i*25)*(1-t),-125*(1-t),.65+.35*t);
            show(a[k],beat(p,.18+i*.075,.23+i*.075));
          });
          ink(a['app-ready'],beat(p,.51,.63));
          show(a['builder-spark'],beat(p,.51,.57));turn(a['builder-spark'],build*50,0,0,.65+.35*build);
          eyes(a['builder-eyes'],p,.62);
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
