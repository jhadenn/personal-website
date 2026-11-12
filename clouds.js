// Live ASCII cloud scene. Every glyph is re-evaluated from evolving cloud
// density; no image tiles or translated screenshots are used for rendering.
(() => {
  const canvas = document.querySelector('#clouds');
  const ctx = canvas.getContext('2d', { alpha: false });
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, last = 0, elapsed = 0;
  let paused = reduced.matches;

  const gusts = [];
  const pointer = { x: -1000, y: -1000, active: false };
  const fract = n => n - Math.floor(n);
  const hash = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
  const smooth = n => n * n * (3 - 2 * n);
  function noise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y), u = smooth(x - ix), v = smooth(y - iy);
    return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)
      +(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v;
  }
  function syncControl() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play cloud animation' : 'Pause cloud animation');
    toggle.title = paused ? 'Play clouds' : 'Pause clouds';
    toggle.textContent = paused ? '▷' : 'Ⅱ';
  }
  // The reference supplies the large-scale cloud contours. Sampling a small
  // density field removes the photo's printed dots; live cells rebuild them.
  const field = document.createElement('canvas');
  field.width = 180; field.height = 320;
  let pixels;
  const reference = new Image();
  reference.onload = () => {
    const fc = field.getContext('2d', {willReadFrequently:true});
    fc.drawImage(reference,0,0,field.width,field.height);
    pixels = fc.getImageData(0,0,field.width,field.height).data;
    restart();
  };
  reference.src = 'assets/cloud-reference.png';
  function sample(u,v) {
    // Reflected boundaries avoid a visible seam while the flow crosses edges.
    u = 1-Math.abs(((u%2)+2)%2-1);
    v = Math.max(0,Math.min(.999,v));
    const fx=u*(field.width-1), fy=v*(field.height-1);
    const x=Math.floor(fx),y=Math.floor(fy), ax=fx-x,ay=fy-y;
    const luminance=(px,py)=>{
      const i=(py*field.width+px)*4;
      return (pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722)/255;
    };
    const x1=Math.min(x+1,field.width-1),y1=Math.min(y+1,field.height-1);
    return (luminance(x,y)*(1-ax)+luminance(x1,y)*ax)*(1-ay)
      +(luminance(x,y1)*(1-ax)+luminance(x1,y1)*ax)*ay;
  }
  function render(dt) {
    elapsed += dt;
    ctx.fillStyle = '#030719'; ctx.fillRect(0,0,width,height);
    if (!pixels) return;
    const cell = width < 600 ? 5 : 6;
    for (let i=gusts.length-1;i>=0;i--) {
      gusts[i].age += dt;
      if(gusts[i].age>2.8)gusts.splice(i,1);
    }
    for(let y=0;y<height;y+=cell) for(let x=0;x<width;x+=cell) {
      let dx=0,dy=0,clearing=0;
      if(pointer.active) {
        const px=x-pointer.x,py=y-pointer.y,d=Math.hypot(px,py);
        const force=Math.max(0,1-d/145)**2;
        dx=px/(d||1)*force*65;dy=py/(d||1)*force*65;
        clearing=force*.5;
      }
      for(const gust of gusts) {
        const gx=x-gust.x,gy=y-gust.y,d=Math.hypot(gx,gy);
        const force=Math.exp(-(((d-gust.age*105)/40)**2))*(1-gust.age/2.8);
        dx+=gx/(d||1)*force*38;dy+=gy/(d||1)*force*38;
        clearing+=force*.2;
      }
      const u=(x-dx)/width,v=(y-dy)/height;
      // Different flow speeds and evolving domain warps make banks billow
      // independently, rather than translating a pre-rendered background.
      const flow=elapsed*(.008+.003*Math.sin(v*8));
      const warpX=(noise(u*5+elapsed*.035,v*6)-.5)*.065;
      const warpY=(noise(u*7,v*5+elapsed*.045)-.5)*.045;
      let density=sample(u-flow+warpX,v+warpY);
      density+=(noise(u*38-elapsed*.05,v*45+elapsed*.025)-.5)*.07;
      density-=clearing;
      const cx=x+cell/2,cy=y+cell/2;
      // In the source, highlights are solid cream with dark punctures, NOT
      // pale letters floating on a black background. Rebuild that polarity.
      let paper, ink, mark;
      if(density>.68){paper='#fffde0';ink='#101326';mark='dot';}
      else if(density>.56){paper='#eeefd4';ink='#182633';mark='cross';}
      else if(density>.43){paper='#a5c3bc';ink='#11232f';mark='cross';}
      else if(density>.30){paper='#4d777c';ink='#cfdbca';mark='cross';}
      else if(density>.16){paper='#102a38';ink='#89ada8';mark='dot';}
      else{paper='#030719';ink='#284450';mark='dot';}
      ctx.fillStyle=paper;ctx.fillRect(x,y,cell,cell);
      ctx.fillStyle=ink;
      if(mark==='dot') {
        const size=density>.68?1.35:density>.16?1.4:.7;
        ctx.fillRect(cx-size/2,cy-size/2,size,size);
      } else {
        ctx.strokeStyle=ink;ctx.lineWidth=density>.56?1.1:.85;
        const arm=density>.56?2:2.4;
        ctx.beginPath();ctx.moveTo(cx-arm,cy-arm);ctx.lineTo(cx+arm,cy+arm);
        ctx.moveTo(cx+arm,cy-arm);ctx.lineTo(cx-arm,cy+arm);ctx.stroke();
      }
    }
  }  function tick(now) {
    frame = 0;
    if (document.hidden || paused) { last = 0; return; }
    if (!last || now-last>=32) {
      const dt = last ? Math.min((now-last)/1000,.07) : 0;
      last = now; render(dt);
    }
    frame = requestAnimationFrame(tick);
  }
  function restart() {
    cancelAnimationFrame(frame); last = 0; syncControl(); render(0);
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {

    width=innerWidth; height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=width*dpr; canvas.height=height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);


    restart();
  }
  window.addEventListener('pointermove',event=>{
    if (paused) return;
    pointer.x=event.clientX;pointer.y=event.clientY;pointer.active=true;
  },{passive:true});
  document.addEventListener('pointerleave',()=>{pointer.active=false;});
  window.addEventListener('blur',()=>{pointer.active=false;});
  window.addEventListener('pointerup',event=>{if(event.pointerType==='touch')pointer.active=false;},{passive:true});
  window.addEventListener('pointercancel',()=>{pointer.active=false;},{passive:true});
  window.addEventListener('pointerdown',event=>{
    if(paused || event.target.closest('a,button'))return;
    if(gusts.length>=8)gusts.shift();
    gusts.push({x:event.clientX,y:event.clientY,age:0});
  },{passive:true});
  window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',restart);
  reduced.addEventListener('change',event=>{paused=event.matches;pointer.active=false;gusts.length=0;restart();});
  toggle.addEventListener('click',()=>{paused=!paused;restart();});
  resize();
})();
