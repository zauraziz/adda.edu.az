'use client';

// ── Faza 1 / Hero 2c: WebGL maye fon ─────────────────────────────────
// ui.js bölmə 1 buraya köçdü. three.js (CDN, ~600 kB) ARADAN QALXDI —
// shader tam-ekran quad üçün idi, ona görə xam WebGL kifayətdir.
// Fragment shader baytbabayt eynidir; vertex shader-də three-nin PlaneGeometry(2,2)
// uv-si əvəzinə vUv=(aPos+1)/2 hesablanır (riyazi olaraq eyni).
// Ekvivalentlik three r128 ilə headless-gl-də piksel-piksel yoxlanılıb: 0 fərq.
import { useEffect } from 'react';

const VERT =
  'attribute vec2 aPos;varying vec2 vUv;void main(){vUv=(aPos+1.0)*0.5;gl_Position=vec4(aPos,0.,1.);}';

const FRAG =
  'precision highp float;varying vec2 vUv;uniform float uTime;uniform vec2 uMouse;uniform vec2 uRes;' +
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}' +
  'float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}' +
  'float fbm(vec2 p){float v=0.;float a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}' +
  'void main(){vec2 asp=vec2(uRes.x/uRes.y,1.);vec2 p=vUv*asp*3.0;float t=uTime*.13;' +
  'float n1=fbm(p+vec2(t*.6,-t*.4));float n2=fbm(p*1.6+vec2(-t*.5,t*.35)+n1*1.5);' +
  'float d=distance(vUv*asp,uMouse*asp);float rip=.05*sin(28.*d-uTime*2.4)*exp(-4.5*d);float m=n2+rip;' +
  'vec3 cWhite=vec3(.97,.99,1.);vec3 cSilver=vec3(.886,.929,.949);vec3 cAqua=vec3(.565,.878,.937);vec3 cCyan=vec3(0.,.706,.847);' +
  'vec3 col=mix(cWhite,cSilver,smoothstep(.12,.48,m));col=mix(col,cAqua,smoothstep(.42,.78,m));col=mix(col,cCyan,smoothstep(.7,1.05,m)*.78);' +
  'float sparkle=pow(smoothstep(.8,.97,fbm(p*2.6+vec2(t*1.2,t*1.5))),4.);col+=sparkle*.28;' +
  'gl_FragColor=vec4(col,1.);}';

export default function HeroFluid() {
  useEffect(() => {
    const canvas = document.getElementById('fluidCanvas') as HTMLCanvasElement | null;
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;

    // ui.js ilə eyni fallback: .hero.no-webgl qradiyenti qalır
    const fail = () => { hero.classList.add('no-webgl'); canvas.remove(); };

    const attrs: WebGLContextAttributes = { antialias: false, alpha: false, powerPreference: 'high-performance' };
    const gl = (canvas.getContext('webgl2', attrs) ||
                canvas.getContext('webgl', attrs)) as WebGL2RenderingContext | WebGLRenderingContext | null;
    if (!gl) { fail(); return; }

    let raf = 0;
    let disposed = false;

    try {
      const sh = (type: number, src: string) => {
        const s = gl.createShader(type);
        if (!s) throw new Error('createShader');
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'compile');
        return s;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      const prog = gl.createProgram();
      if (!prog) throw new Error('createProgram');
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const aPos = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'uTime');
      const uMouse = gl.getUniformLocation(prog, 'uMouse');
      const uRes = gl.getUniformLocation(prog, 'uRes');

      const pr = Math.min(window.devicePixelRatio || 1, 1.5); // ui.js: setPixelRatio(min(dpr,1.5))
      const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
      const t0 = performance.now();

      const draw = () => {
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uTime, (performance.now() - t0) / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const size = () => {
        const w = hero.clientWidth, h = hero.clientHeight;
        canvas.width = Math.floor(w * pr);   // ui.js: setSize(w,h,false) → CSS ölçüsünə toxunmur
        canvas.height = Math.floor(h * pr);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(uRes, w, h);            // uRes CSS piksellə (ui.js ilə eyni)
        if (reduced) draw();
      };
      size();
      window.addEventListener('resize', size);

      const onMove = (e: MouseEvent) => {
        const r = hero.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width;
        mouse.ty = 1 - (e.clientY - r.top) / r.height;
      };
      hero.addEventListener('mousemove', onMove);

      let running = false;
      const loop = () => { if (disposed) return; draw(); raf = requestAnimationFrame(loop); };
      const start = () => { if (running || disposed || reduced) return; running = true; loop(); };
      const stop = () => { running = false; cancelAnimationFrame(raf); };

      // Hero ekrandan çıxanda dövrü dayandır (ui.js həmişə işlədirdi → boş GPU yükü)
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) start(); else stop(); }, { threshold: 0 });
      io.observe(hero);
      if (reduced) draw(); // hərəkət azaldılıbsa: tək statik kadr

      return () => {
        disposed = true;
        stop();
        io.disconnect();
        window.removeEventListener('resize', size);
        hero.removeEventListener('mousemove', onMove);
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      };
    } catch {
      fail();
    }
  }, []);

  return null;
}
