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

/* 2-3. JALUZİ SLICES + MAGNETIC BUTTON
   Faza 1 / Hero 2b-də app/_components/HeroSlider.tsx-ə köçdü
   (SLIDES artıq dilə uyğun, gsap npm-dən dinamik import).
   Burada TƏKRAR ETMƏ — ikiqat listener/slice yaranar. */

/* 4. SAYĞACLAR (statsec)
   Qeyd: header/a11y (scrolled, şrift, kontrast), infofor və burger
   Faza 1b-də app/_components/HeaderIsland.tsx-ə köçdü — burada TƏKRAR ETMƏ,
   yoxsa listener-lər ikiqat bağlanar. */
const nums=document.querySelectorAll('.statsec .num');let counted=false;
function countUp(){if(counted)return;const sec=document.querySelector('.statsec');const r=sec.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0){counted=true;nums.forEach(n=>{const t=+n.dataset.target;const span=n.querySelector('span');let c=0;const step=t/60;const iv=setInterval(()=>{c+=step;if(c>=t){c=t;clearInterval(iv);}span.textContent=Math.round(c).toLocaleString('az');},25);});}}
window.addEventListener('scroll',countUp);window.addEventListener('load',countUp);


/* Calendar interaction */
document.querySelectorAll('.cal-d.ev').forEach(d=>d.addEventListener('click',()=>{
  const day=d.dataset.day;
  document.querySelectorAll('.cal-d.ev').forEach(x=>x.classList.toggle('on',x===d));
  document.querySelectorAll('.cal-ev').forEach(ev=>ev.classList.toggle('on',ev.dataset.day===day));
}));
