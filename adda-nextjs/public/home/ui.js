/* 1. WEBGL LIQUID */
(function(){
  const canvas=document.getElementById('fluidCanvas');
  const hero=document.getElementById('hero');
  if(!window.THREE){hero.classList.add('no-webgl');canvas.remove();return;}
  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    const scene=new THREE.Scene();const camera=new THREE.Camera();
    const uniforms={uTime:{value:0},uMouse:{value:new THREE.Vector2(0.5,0.5)},uRes:{value:new THREE.Vector2(hero.clientWidth,hero.clientHeight)}};
    const mat=new THREE.ShaderMaterial({uniforms,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader:'precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;'+
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}'+
      'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}'+
      'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}'+
      'void main(){vec2 asp=vec2(uRes.x/uRes.y,1.);vec2 p=vUv*asp*3.0;float t=uTime*.13;'+
      'float n1=fbm(p+vec2(t*.6,-t*.4));float n2=fbm(p*1.6+vec2(-t*.5,t*.35)+n1*1.5);'+
      'float d=distance(vUv*asp,uMouse*asp);float rip=.05*sin(28.*d-uTime*2.4)*exp(-4.5*d);float m=n2+rip;'+
      'vec3 cWhite=vec3(.97,.99,1.);vec3 cSilver=vec3(.886,.929,.949);vec3 cAqua=vec3(.565,.878,.937);vec3 cCyan=vec3(0.,.706,.847);'+
      'vec3 col=mix(cWhite,cSilver,smoothstep(.12,.48,m));col=mix(col,cAqua,smoothstep(.42,.78,m));col=mix(col,cCyan,smoothstep(.7,1.05,m)*.78);'+
      'float sparkle=pow(smoothstep(.8,.97,fbm(p*2.6+vec2(t*1.2,t*1.5))),4.);col+=sparkle*.28;'+
      'gl_FragColor=vec4(col,1.);}'});
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
    const mouse={x:.5,y:.5,tx:.5,ty:.5};
    hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();mouse.tx=(e.clientX-r.left)/r.width;mouse.ty=1.-(e.clientY-r.top)/r.height;});
    function size(){const w=hero.clientWidth,h=hero.clientHeight;renderer.setSize(w,h,false);uniforms.uRes.value.set(w,h);}
    size();window.addEventListener('resize',size);
    const clock=new THREE.Clock();
    renderer.setAnimationLoop(()=>{mouse.x+=(mouse.tx-mouse.x)*.05;mouse.y+=(mouse.ty-mouse.y)*.05;uniforms.uMouse.value.set(mouse.x,mouse.y);uniforms.uTime.value=clock.getElapsedTime();renderer.render(scene,camera);});
  }catch(e){hero.classList.add('no-webgl');canvas.remove();}
})();

/* 2. JALUZİ SLICES */
const SLIDES=[
  {img:'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=82&w=1920&h=1080&fit=crop',
   kicker:'Azərbaycan Dövlət Dəniz Akademiyası',
   title:'Gələcəyin <em>dənizçiliyi</em>',
   lead:'Firuzəyi üfüqlərə açılan rəqəmsal təhsil. Beynəlxalq STCW standartları, canlı simulyasiya mühiti və qlobal karyera trayektoriyası.',
   cta:'Daxil ol'},
  {img:'https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=82&w=1920&h=1080&fit=crop',
   kicker:'Wärtsilä NTPRO təlim bazası',
   title:'Simulyasiya <em>təcrübəsi</em>',
   lead:'Kapitan körpüsü, GMDSS və mühərrik simulyatorlarında real ssenarilər. Nəzəriyyə deyil — yaşanan akademik təcrübə.',
   cta:'Virtual tura başla'},
  {img:'https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=82&w=1920&h=1080&fit=crop',
   kicker:'47+ beynəlxalq tərəfdaş',
   title:'Qlobal <em>üfüqlər</em>',
   lead:'IAMU şəbəkəsi, mübadilə proqramları və dünya donanmalarına açılan karyera yolları.',
   cta:'Tərəfdaşlara bax'}
];
const N=9, IMG_RATIO=16/9;
const slicesRoot=document.getElementById('slices');
const hero=document.getElementById('hero');
const sliceEls=[],flippers=[];
for(let i=0;i<N;i++){
  const s=document.createElement('div');s.className='slice';
  const f=document.createElement('div');f.className='flipper';
  const fr=document.createElement('div');fr.className='face front';
  const bk=document.createElement('div');bk.className='face back';
  f.appendChild(fr);f.appendChild(bk);s.appendChild(f);slicesRoot.appendChild(s);
  sliceEls.push({front:fr,back:bk});flippers.push(f);
}
let W=0,H=0,SW=0;
function faceCSS(el,idx,i){
  let bw,bh;
  if(W/H>IMG_RATIO){bw=W;bh=W/IMG_RATIO;}else{bh=H;bw=H*IMG_RATIO;}
  const px=-(i*SW)-(bw-W)/2, py=-(bh-H)/2;
  el.style.backgroundImage="url('"+SLIDES[idx].img+"')";
  el.style.backgroundBlendMode='normal';
  el.style.backgroundSize=bw+"px "+bh+"px";
  el.style.backgroundPosition=px+"px "+py+"px";
}
let cur=0,anim=false;
function layout(){W=hero.clientWidth;H=hero.clientHeight;SW=W/N;sliceEls.forEach((s,i)=>{faceCSS(s.front,cur,i);});}
layout();window.addEventListener('resize',layout);
const gcKicker=document.getElementById('gcKicker'),gcTitle=document.getElementById('gcTitle'),gcLead=document.getElementById('gcLead'),gcCta=document.getElementById('gcCta');
function swapText(n){
  const items=document.querySelectorAll('.gc-anim');
  if(window.gsap){
    gsap.to(items,{y:14,opacity:0,duration:.26,stagger:.04,ease:'power2.in',onComplete:()=>{
      gcKicker.textContent=SLIDES[n].kicker;gcTitle.innerHTML=SLIDES[n].title;gcLead.textContent=SLIDES[n].lead;gcCta.textContent=SLIDES[n].cta;
      gsap.to(items,{y:0,opacity:1,duration:.42,stagger:.06,ease:'power3.out',delay:.22});
    }});
  }else{gcKicker.textContent=SLIDES[n].kicker;gcTitle.innerHTML=SLIDES[n].title;gcLead.textContent=SLIDES[n].lead;gcCta.textContent=SLIDES[n].cta;}
}
const numBtns=document.querySelectorAll('.numb');
function updateNums(){numBtns.forEach(b=>b.classList.remove('active'));const a=numBtns[cur];void a.querySelector('.pb i').offsetWidth;a.classList.add('active');}
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function go(n){
  const next=(n+SLIDES.length)%SLIDES.length;
  if(anim||next===cur)return;anim=true;
  sliceEls.forEach((s,i)=>faceCSS(s.back,next,i));
  swapText(next);
  if(window.gsap&&!reduced){
    gsap.to(flippers,{rotationY:180,duration:.92,ease:'power3.inOut',stagger:{each:.055,from:next>cur?'start':'end'},
      onComplete:()=>{sliceEls.forEach((s,i)=>faceCSS(s.front,next,i));gsap.set(flippers,{rotationY:0});cur=next;anim=false;updateNums();}});
  }else{sliceEls.forEach((s,i)=>faceCSS(s.front,next,i));cur=next;anim=false;updateNums();}
}
numBtns.forEach(b=>{b.addEventListener('mouseenter',()=>{go(+b.dataset.n);resetTimer();});b.addEventListener('click',()=>{go(+b.dataset.n);resetTimer();});});
let timer=setInterval(()=>go(cur+1),5000);
function resetTimer(){clearInterval(timer);timer=setInterval(()=>go(cur+1),5000);}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){go(cur+1);resetTimer();}if(e.key==='ArrowLeft'){go(cur-1);resetTimer();}});

/* 3. MAGNETIC BUTTON */
(function(){
  const btn=document.getElementById('btnMag'),arr=document.getElementById('magArr');
  if(!window.gsap||!btn)return;
  const xTo=gsap.quickTo(btn,'x',{duration:.4,ease:'power3'}),yTo=gsap.quickTo(btn,'y',{duration:.4,ease:'power3'});
  const axTo=gsap.quickTo(arr,'x',{duration:.35,ease:'power3'}),ayTo=gsap.quickTo(arr,'y',{duration:.35,ease:'power3'});
  btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();const dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2;xTo(dx*.3);yTo(dy*.3);axTo(dx*.2);ayTo(dy*.2);});
  btn.addEventListener('mouseleave',()=>{gsap.to(btn,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'});gsap.to(arr,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'});});
})();

/* 4. HEADER / A11Y / COUNTERS / BURGER */
const headerEl=document.getElementById('siteHeader');
window.addEventListener('scroll',()=>{if(window.scrollY>120)headerEl.classList.add('scrolled');else headerEl.classList.remove('scrolled');});
let scale=1;
document.getElementById('fontUpBtn').onclick=()=>{scale=Math.min(1.3,scale+0.1);document.documentElement.style.setProperty('--fs-scale',scale);};
document.getElementById('fontDownBtn').onclick=()=>{scale=Math.max(0.9,scale-0.1);document.documentElement.style.setProperty('--fs-scale',scale);};
document.getElementById('contrastBtn').onclick=()=>document.body.classList.toggle('high-contrast');
const nums=document.querySelectorAll('.statsec .num');let counted=false;
function countUp(){if(counted)return;const sec=document.querySelector('.statsec');const r=sec.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0){counted=true;nums.forEach(n=>{const t=+n.dataset.target;const span=n.querySelector('span');let c=0;const step=t/60;const iv=setInterval(()=>{c+=step;if(c>=t){c=t;clearInterval(iv);}span.textContent=Math.round(c).toLocaleString('az');},25);});}}
window.addEventListener('scroll',countUp);window.addEventListener('load',countUp);


/* Calendar interaction */
document.querySelectorAll('.cal-d.ev').forEach(d=>d.addEventListener('click',()=>{
  const day=d.dataset.day;
  document.querySelectorAll('.cal-d.ev').forEach(x=>x.classList.toggle('on',x===d));
  document.querySelectorAll('.cal-ev').forEach(ev=>ev.classList.toggle('on',ev.dataset.day===day));
}));

/* INFO FOR (Bunlar üçün) dropdown */
(function(){
  const wrap=document.getElementById('infofor');
  const btn=document.getElementById('infoforBtn');
  if(!wrap||!btn)return;
  btn.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open');});
  document.addEventListener('click',e=>{if(!wrap.contains(e.target))wrap.classList.remove('open');});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')wrap.classList.remove('open');});
})();

document.querySelector('.burger').onclick=function(){const n=document.querySelector('.mainnav');const open=n.style.display==='flex';n.style.display=open?'none':'flex';if(!open){n.style.cssText+=';position:absolute;top:82px;left:0;right:0;background:linear-gradient(100deg,#053A52,#02546F);flex-direction:column;padding:16px;height:auto;z-index:200;box-shadow:0 20px 40px rgba(2,75,102,.3)';}};
