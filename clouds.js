// Live ASCII cloud scene. Every glyph is re-evaluated from evolving cloud
// density; no image tiles or translated screenshots are used for rendering.
(() => {
  const canvas = document.querySelector('#clouds');
  const ctx = canvas.getContext('2d', { alpha: false });
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = ['#10182c', '#253549', '#465b66', '#778b8c', '#b4bfb1', '#e1e2c8', '#f5f1d5', '#fffce8'];
  const glyphs = ['.', ':', '+', '*', 'x', '#', '%', '@'];
  let width = 0, height = 0, frame = 0, last = 0, elapsed = 0;
  let paused = reduced.matches;
  let clouds = [];
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
  function makeCloud(index) {
    const scale = Math.min(1.2, Math.max(.65, width / 1200));
    return {
      x: (index / 7) * (width + 550) - 275,
      y: height * [.17,.75,.38,.9,.12,.64,.43][index],
      radius: (155 + hash(index,2)*90)*scale,
      seed: index * 23.7,
      speed: 7 + hash(index,5)*12,
      lobes: Array.from({length:6}, (_,i)=>({
        x: (i/5-.5)*1.65,
        y: (hash(index,i+4)-.5)*.45,
        r: .32+hash(index,i+14)*.22,
        phase: hash(index,i+25)*Math.PI*2
      }))
    };
  }
  function syncControl() {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play cloud animation' : 'Pause cloud animation');
    toggle.title = paused ? 'Play clouds' : 'Pause clouds';
    toggle.textContent = paused ? '▷' : 'Ⅱ';
  }
  function render(dt) {
    elapsed += dt;
    ctx.fillStyle = '#060916'; ctx.fillRect(0,0,width,height);
    const cell = width < 600 ? 9 : 8;
    ctx.font = `${cell + 1}px monospace`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i=gusts.length-1;i>=0;i--) {
      gusts[i].age += dt;
      if (gusts[i].age > 2.8) gusts.splice(i,1);
    }
    for (const cloud of clouds) {
      cloud.x += cloud.speed * dt;
      if (cloud.x - cloud.radius*1.65 > width) cloud.x = -cloud.radius*1.65;
      const r = cloud.radius;
      const cy = cloud.y + Math.sin(elapsed*.18+cloud.seed)*16;
      const lobes = cloud.lobes.map(l=>({
        x: l.x + Math.sin(elapsed*.22+l.phase)*.08,
        y: l.y + Math.cos(elapsed*.27+l.phase)*.08,
        r: l.r*(1+Math.sin(elapsed*.3+l.phase)*.1)
      }));
      const x0 = Math.max(0,Math.floor((cloud.x-r*1.65)/cell)*cell);
      const x1 = Math.min(width,cloud.x+r*1.65);
      const y0 = Math.max(0,Math.floor((cy-r*.85)/cell)*cell);
      const y1 = Math.min(height,cy+r*.85);
      for (let y=y0;y<y1;y+=cell) for (let x=x0;x<x1;x+=cell) {
        const nx = (x-cloud.x)/r, ny = (y-cy)/r;
        let density = 0;
        for (const l of lobes) {
          const d = ((nx-l.x)**2+(ny-l.y)**2*1.5)/(l.r*l.r);
          density += Math.max(0,1-d)**2;
        }
        if (density < .025) continue;
        const billow = noise(nx*4+cloud.seed+elapsed*.035,ny*4+elapsed*.065)*.65
          +noise(nx*11+cloud.seed,ny*11-elapsed*.11)*.25
          +noise(nx*25,ny*25+elapsed*.13)*.1;
        density = Math.min(1,density*.85) + (billow-.5)*.48;
        let dx = 0, dy = 0;
        if (pointer.active) {
          const px=x-pointer.x, py=y-pointer.y, distance=Math.hypot(px,py);
          const influence = Math.max(0,1-distance/150);
          // Air parts around the pointer; the cloud stays in world space.
          density -= influence*influence*.9;
          dx += px/(distance||1)*influence*22;
          dy += py/(distance||1)*influence*22;
        }
        for (const gust of gusts) {
          const gx=x-gust.x, gy=y-gust.y, distance=Math.hypot(gx,gy);
          const ring = Math.exp(-(((distance-gust.age*105)/44)**2))*(1-gust.age/2.8);
          density -= ring*.5;
          dx += gx/(distance||1)*ring*25; dy += gy/(distance||1)*ring*25;
        }
        if (density < .06) continue;
        const level = Math.min(7,Math.floor(density*8));
        // Dark blue edges, cool shaded undersides, cream sunlit interiors.
        const shade = Math.max(0,Math.min(7,level+(ny<-.06?1:0)));
        ctx.fillStyle = palette[shade];
        ctx.fillText(glyphs[level],x+cell/2+dx,y+cell/2+dy);
      }
    }
  }
  function tick(now) {
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
    const oldWidth=width, oldHeight=height;
    width=innerWidth; height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=width*dpr; canvas.height=height*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    if (!clouds.length) clouds=Array.from({length:7},(_,i)=>makeCloud(i));
    else for (const cloud of clouds) {cloud.x*=width/oldWidth;cloud.y*=height/oldHeight;}
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
