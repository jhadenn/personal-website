// A solid Gothic cross, sampled in 3D and projected into an ASCII depth buffer.
(() => {
  const fallback = document.querySelector('.ascii-cross');
  const backdrop = document.querySelector('.cross-backdrop');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.className = 'cross-model';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Sculpted ASCII cross. Drag to spin, use arrow keys to rotate, or double-click or press Home to reset.');
  canvas.title = 'Drag to spin · double-click to reset';
  backdrop.removeAttribute('aria-hidden');
  fallback.replaceWith(canvas);

  // Four curved, three-pointed arms. Their narrow stems meet under a raised boss.
  const outline = new Path2D();
  const arm = new Path2D();
  arm.moveTo(-.13, 0);
  arm.bezierCurveTo(-.12, .42, -.13, .70, -.36, .88);
  arm.bezierCurveTo(-.46, .97, -.31, 1.03, -.20, .92);
  arm.bezierCurveTo(-.14, .94, -.12, 1.08, 0, 1.14);
  arm.bezierCurveTo(.12, 1.08, .14, .94, .20, .92);
  arm.bezierCurveTo(.31, 1.03, .46, .97, .36, .88);
  arm.bezierCurveTo(.13, .70, .12, .42, .13, 0);
  arm.closePath();
  for (const [angle, length] of [[180, 1.02], [0, 1.65], [90, .94], [-90, .94]]) {
    outline.addPath(arm, new DOMMatrix().rotate(angle).scale(1, length));
  }
  const center = new Path2D();
  center.arc(0, 0, .19, 0, Math.PI * 2, true);
  outline.addPath(center);

  const step = .012, width = 211, height = 275;
  const mask = new Uint8Array(width * height);
  const distance = new Float32Array(width * height);
  const relief = new Float32Array(width * height);
  const position = (col, row) => [(col - 105) * step, (row - 98) * step];
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const i = row * width + col;
      const [x, y] = position(col, row);
      mask[i] = context.isPointInPath(outline, x, y, 'nonzero') ? 1 : 0;
      distance[i] = mask[i] ? 1000 : 0;
    }
  }
  // Distance to the contour makes the front and back bevel follow every petal.
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const i = row * width + col;
      if (mask[i]) distance[i] = Math.min(distance[i], distance[i-1]+1, distance[i-width]+1, distance[i-width-1]+1.414, distance[i-width+1]+1.414);
    }
  }
  for (let row = height - 2; row > 0; row--) {
    for (let col = width - 2; col > 0; col--) {
      const i = row * width + col;
      if (mask[i]) distance[i] = Math.min(distance[i], distance[i+1]+1, distance[i+width]+1, distance[i+width-1]+1.414, distance[i+width+1]+1.414);
    }
  }
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const i = row * width + col;
      if (!mask[i]) continue;
      const [x, y] = position(col, row);
      const bevel = .11 * Math.sin(Math.min(distance[i] * step / .12, 1) * Math.PI / 2);
      const ridge = .075 * Math.exp(-Math.min(x*x, y*y) / .0025);
      const boss = .14 * Math.exp(-(x*x+y*y) / .022);
      relief[i] = .115 + bevel + ridge + boss;
    }
  }
  const points = [];
  function add(x,y,z,nx,ny,nz) {
    const length = Math.hypot(nx,ny,nz);
    points.push([x,y-.25,z,nx/length,ny/length,nz/length]);
  }
  for (let row = 1; row < height - 1; row++) {
    for (let col = 1; col < width - 1; col++) {
      const i = row * width + col;
      if (!mask[i]) continue;
      const [x,y] = position(col,row);
      const dx = ((mask[i+1] ? relief[i+1] : .115) - (mask[i-1] ? relief[i-1] : .115)) / (2*step);
      const dy = ((mask[i+width] ? relief[i+width] : .115) - (mask[i-width] ? relief[i-width] : .115)) / (2*step);
      add(x,y,relief[i],-dx,-dy,1);
      add(x,y,-relief[i],-dx,-dy,-1);
      // Every exposed contour segment gets a continuous solid wall.
      for (const [dc,dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        if (mask[i+dc+dr*width]) continue;
        for (let z=-relief[i]; z<=relief[i]; z+=step) add(x+dc*step/2,y+dr*step/2,z,dc,dr,0);
      }
    }
  }

  let pitch = -.12, yaw = -.40, drag = null, pending = false;
  const cols = 108, rows = 100, cellW = 6, cellH = 10;
  canvas.width = cols * cellW;
  canvas.height = rows * cellH;
  const depth = new Float32Array(cols*rows);
  const light = new Float32Array(cols*rows);
  const glyphs = '.,:;+xX$&#@';
  function draw() {
    pending = false;
    depth.fill(-Infinity); light.fill(0);
    const sx=Math.sin(pitch), cx=Math.cos(pitch), sy=Math.sin(yaw), cy=Math.cos(yaw);
    const sz=Math.sin(-.24), cz=Math.cos(-.24);
    function rotate(x,y,z) {
      const a=x*cy+z*sy, b=-x*sy+z*cy;
      const c=y*cx-b*sx, d=y*sx+b*cx;
      return [a*cz-c*sz,a*sz+c*cz,d];
    }
    for (const p of points) {
      const [x,y,z] = rotate(p[0],p[1],p[2]);
      const [nx,ny,nz] = rotate(p[3],p[4],p[5]);
      if (nz <= -.05) continue;
      const scale=235*4.8/(4.8-z);
      const col=Math.round(cols/2+x*scale/cellW), row=Math.round(rows/2+y*scale/cellH);
      if(col<0||col>=cols||row<0||row>=rows) continue;
      const i=row*cols+col;
      if(z<=depth[i]) continue;
      depth[i]=z;
      const diffuse=Math.max(0,-nx*.45-ny*.55+nz*.70);
      const specular=Math.pow(Math.max(0,-nx*.25-ny*.30+nz*.92),22);
      // Directional silver highlights, dark recessed grooves, and a soft rim.
      light[i]=Math.min(1,.14+.55*diffuse+.65*specular+.13*Math.pow(1-Math.max(0,nz),3));
    }
    context.clearRect(0,0,canvas.width,canvas.height);
    context.font='10px "Courier New", monospace';
    context.textBaseline='top';
    for(let i=0;i<depth.length;i++) {
      if(depth[i]===-Infinity) continue;
      const l=light[i], shade=Math.round(65+l*190);
      context.fillStyle=`rgb(${shade},${shade},${Math.min(255,shade+5)})`;
      context.fillText(glyphs[Math.min(glyphs.length-1,Math.floor(l*glyphs.length))],(i%cols)*cellW,Math.floor(i/cols)*cellH);
    }
  }
  function schedule() { if(!pending) { pending=true; requestAnimationFrame(draw); } }
  function reset() { pitch=-.12; yaw=-.40; schedule(); }
  canvas.addEventListener('pointerdown', event => {
    if(!event.isPrimary||event.button!==0) return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY};
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('dragging');
    canvas.classList.add('pointer-focus');
    canvas.focus({preventScroll:true});
  });
  canvas.addEventListener('pointermove', event => {
    if(!drag||drag.id!==event.pointerId) return;
    yaw+=(event.clientX-drag.x)*.008;
    pitch-=(event.clientY-drag.y)*.008;
    drag.x=event.clientX; drag.y=event.clientY; schedule();
  });
  function stop() { drag=null; canvas.classList.remove('dragging'); }
  for(const event of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(event,stop);
  canvas.addEventListener('dblclick',reset);
  canvas.addEventListener('blur',()=>canvas.classList.remove('pointer-focus'));
  canvas.addEventListener('keydown',event=>{
    canvas.classList.remove('pointer-focus');
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)) return;
    event.preventDefault();
    if(event.key==='Home') return reset();
    if(event.key==='ArrowLeft') yaw-=.15;
    if(event.key==='ArrowRight') yaw+=.15;
    if(event.key==='ArrowUp') pitch+=.15;
    if(event.key==='ArrowDown') pitch-=.15;
    schedule();
  });
  draw();
})();
