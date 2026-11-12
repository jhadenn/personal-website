// Run the real renderer in a deterministic canvas stub. This measures drawing
// workload, not GPU time; browser visual checks remain necessary.
const fs = require('node:fs');
const vm = require('node:vm');
let calls = 0, next, image;
const context = new Proxy({}, {get: (_,key) => key === 'getImageData'
  ? () => ({data:new Uint8ClampedArray(180*320*4).fill(190)})
  : () => { calls++; }});
const canvas = () => ({width:0,height:0,getContext:()=>context});
const button = {setAttribute(){},addEventListener(){}};
const sandbox = {
  document:{querySelector:s=>s==='#clouds'?canvas():button,createElement:canvas,addEventListener(){},hidden:false},
  window:{addEventListener(){}},innerWidth:1920,innerHeight:1080,devicePixelRatio:2,
  matchMedia:()=>({matches:false,addEventListener(){}}),
  requestAnimationFrame:fn=>{next=fn;return 1;},cancelAnimationFrame(){},
  Image:class {constructor(){image=this;}}, performance,
};
vm.runInNewContext(fs.readFileSync('clouds.js','utf8'),sandbox);
if(image?.onload)image.onload();
calls=0;
const start=performance.now();
for(let i=1;i<=30;i++)next(i*60);
const perFrame=Math.round(calls/30);
console.log(JSON.stringify({drawCallsPerFrame:perFrame,simulationMs:Math.round(performance.now()-start),budget:200}));
if(perFrame>200)process.exitCode=1;
