// Bake fine halftone detail once, then animate a small set of soft cloud puffs.
// Per-frame work is bounded independently of viewport area and pixel density.
(() => {
  const canvas = document.querySelector('#clouds');
  const ctx = canvas.getContext('2d', {alpha:false});
  const toggle = document.querySelector('#motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,last=0,frame=0,time=0,paused=reduced.matches;
  const pointer={x:-1000,y:-1000,active:false};
  const gusts=[];
  const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
  function bake(seed) {
    const sprite=document.createElement('canvas');sprite.width=180;sprite.height=160;
    const g=sprite.getContext('2d');
    const cell=3;
    for(let y=0;y<160;y+=cell)for(let x=0;x<180;x+=cell){
      const nx=(x-90)/86,ny=(y-80)/75;
      const radius=Math.sqrt(nx*nx+ny*ny);
      const edge=1-radius+(hash(Math.floor(x/12)+seed,Math.floor(y/12))-.5)*.07;
      if(edge<=0)continue;
      g.globalAlpha=Math.min(1,edge*5);
      const light=.67-ny*.34+Math.sin(nx*5+seed)*.07+(hash(x+seed,y)-.5)*.1;
      g.fillStyle=light>.75?'#fffde0':light>.6?'#e9ecd4':light>.45?'#a7c3b9':light>.3?'#557b7e':'#203d4b';
      g.fillRect(x,y,cell,cell);
      g.fillStyle=light>.6?'#263342':'#a9c4b9';
      if(light>.72)g.fillRect(x+1,y+1,.7,.7);
      else{g.fillRect(x+.5,y+.5,.65,.65);g.fillRect(x+1.2,y+1.2,.65,.65);g.fillRect(x+1.9,y+1.9,.65,.65);g.fillRect(x+1.9,y+.5,.65,.65);g.fillRect(x+.5,y+1.9,.65,.65);}
    }
    return sprite;
  }
  const sprites=Array.from({length:5},(_,i)=>bake(i*7));
  const clouds=Array.from({length:6},(_,i)=>({
    x:0,y:0,seed:i*1.7,speed:8+i*1.5,scale:.72+hash(i,4)*.35,dx:0,dy:0,
    // Low side puffs and a high central crown produce a cumulus silhouette.
    puffs:[[-.7,.18,.7], [.6,.19,.78],[-.32,-.04,.95],[.32,-.09,1], [0,-.3,1.05]]
  }));
  function render(dt){
    time+=dt;ctx.globalAlpha=1;ctx.fillStyle='#060916';ctx.fillRect(0,0,width,height);
    const size=Math.min(112,Math.max(68,width*.075));
    for(let i=gusts.length-1;i>=0;i--){gusts[i].age+=dt;if(gusts[i].age>2)gusts.splice(i,1);}
    for(const cloud of clouds){
      cloud.x+=cloud.speed*dt;
      if(cloud.x>width+size*2)cloud.x=-size*2;
      let tx=0,ty=0;
      if(pointer.active){
        const dx=cloud.x-pointer.x,dy=cloud.y-pointer.y,d=Math.hypot(dx,dy);
        const force=Math.max(0,1-d/(size*2.5));
        tx=dx/(d||1)*force*65;ty=dy/(d||1)*force*45;
      }
      for(const gust of gusts){
        const dx=cloud.x-gust.x,dy=cloud.y-gust.y,d=Math.hypot(dx,dy);
        const force=Math.max(0,1-Math.abs(d-gust.age*150)/160)*(1-gust.age/2);
        tx+=dx/(d||1)*force*40;ty+=dy/(d||1)*force*25;
      }
      const ease=1-Math.exp(-dt*3);
      cloud.dx+=(tx-cloud.dx)*ease;cloud.dy+=(ty-cloud.dy)*ease;
      const cx=cloud.x+cloud.dx,cy=cloud.y+cloud.dy;
      // Fade the cloud itself around the text, avoiding a dark rectangular mask.
      const clear=Math.exp(-(((cx-width/2)/(width<650?210:440))**2));
      ctx.globalAlpha=.68-clear*.56;
      cloud.puffs.forEach(([px,py,scale],i)=>{
        const breathe=1+Math.sin(time*.45+cloud.seed+i)*.035;
        const w=size*1.4*scale*breathe*cloud.scale,h=w*.89;
        const x=cx+px*size*cloud.scale+Math.sin(time*.22+i+cloud.seed)*3;
        const y=cy+py*size*cloud.scale+Math.sin(time*.3+cloud.seed+i)*4;
        ctx.drawImage(sprites[i],x-w/2,y-h/2,w,h);
      });
    }
    ctx.globalAlpha=1;
  }
  function sync(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Play cloud animation':'Pause cloud animation');toggle.title=paused?'Play clouds':'Pause clouds';toggle.textContent=paused?'▷':'Ⅱ';}
  function tick(now){
    frame=0;if(paused||document.hidden){last=0;return;}
    if(!last||now-last>=50){const dt=last?Math.min((now-last)/1000,.1):0;last=now;render(dt);}
    frame=requestAnimationFrame(tick);
  }
  function restart(){cancelAnimationFrame(frame);last=0;sync();render(0);if(!paused&&!document.hidden)frame=requestAnimationFrame(tick);}
  function resize(){
    const ow=width,oh=height;width=innerWidth;height=innerHeight;
    // One backing pixel per CSS pixel is enough for deliberately pixelated art.
    canvas.width=width;canvas.height=height;
    clouds.forEach((c,i)=>{c.x=ow?c.x*width/ow:width*[.1,.83,.23,.94,.05,.77][i];c.y=oh?c.y*height/oh:height*[.17,.15,.52,.48,.81,.85][i];});
    restart();
  }
  window.addEventListener('pointermove',e=>{if(paused)return;pointer.x=e.clientX;pointer.y=e.clientY;pointer.active=true;},{passive:true});
  const leave=()=>{pointer.active=false;};
  document.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
  window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')leave();},{passive:true});
  window.addEventListener('pointercancel',leave,{passive:true});
  window.addEventListener('pointerdown',e=>{if(paused||e.target.closest('a,button'))return;if(gusts.length>=3)gusts.shift();gusts.push({x:e.clientX,y:e.clientY,age:0});},{passive:true});
  window.addEventListener('resize',resize);document.addEventListener('visibilitychange',restart);
  reduced.addEventListener('change',e=>{paused=e.matches;leave();gusts.length=0;restart();});
  toggle.addEventListener('click',()=>{paused=!paused;restart();});resize();
})();
