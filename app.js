// Reconstruct the supplied cloud image as colored ASCII cells, then move the
// resulting tile rightward. Mirrored tile edges keep the loop seamless.
const canvas = document.querySelector('#clouds');
const context = canvas.getContext('2d');
const toggle = document.querySelector('#motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
let tile, offset = 0, last = 0, frame = 0;
let width = 0, height = 0;
function updateToggle() {
  toggle.setAttribute('aria-pressed', String(paused));
  toggle.setAttribute('aria-label', paused ? 'Play cloud animation' : 'Pause cloud animation');
  toggle.title = paused ? 'Play clouds' : 'Pause clouds';
  toggle.textContent = paused ? '▷' : 'Ⅱ';
}
function draw(time) {
  frame = 0;
  if (!tile) return;
  if (last && !paused) offset = (offset + Math.min(time - last, 100) * .014) % tile.width;
  last = time;
  context.clearRect(0, 0, width, height);
  for (let x = offset - tile.width; x < width; x += tile.width) context.drawImage(tile, x, 0);
  if (!paused && !document.hidden) frame = requestAnimationFrame(draw);
}
function restart() {
  cancelAnimationFrame(frame); last = 0; updateToggle(); draw(performance.now());
}
const cloudImage = new Image();
function resize() {
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * dpr; canvas.height = height * dpr;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!cloudImage.naturalWidth) return;
  const cell = 8, rows = Math.ceil(height / cell), columns = Math.ceil(Math.max(640, height * .5625) / cell);
  const sample = document.createElement('canvas'); sample.width = columns; sample.height = rows;
  const sc = sample.getContext('2d', {willReadFrequently:true});
  sc.drawImage(cloudImage, 0, 0, columns, rows);
  const data = sc.getImageData(0, 0, columns, rows).data;
  const half = document.createElement('canvas'); half.width = columns * cell; half.height = rows * cell;
  const hc = half.getContext('2d'); hc.fillStyle = '#040718'; hc.fillRect(0,0,half.width,half.height);
  hc.font = '9px monospace'; hc.textAlign = 'center'; hc.textBaseline = 'middle';
  const glyphs = ' .:+*#%@';
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const i = (y * columns + x) * 4, r = data[i], g = data[i+1], b = data[i+2];
    const light = (.2126*r + .7152*g + .0722*b) / 255;
    // Colors come directly from the reference, including cream and blue shadows.
    hc.fillStyle = `rgb(${r} ${g} ${b})`;
    hc.fillText(glyphs[Math.min(7, Math.floor(light * 8))], x*cell+4, y*cell+4);
  }
  tile = document.createElement('canvas'); tile.width = half.width*2; tile.height = half.height;
  const tc = tile.getContext('2d'); tc.drawImage(half,0,0); tc.translate(tile.width,0); tc.scale(-1,1); tc.drawImage(half,0,0);
  restart();
}
cloudImage.onload = resize;
cloudImage.src = 'assets/cloud-reference.png';
window.addEventListener('resize', resize);
toggle.addEventListener('click', () => { paused = !paused; restart(); });
reduced.addEventListener('change', event => { paused = event.matches; restart(); });
document.addEventListener('visibilitychange', restart);
updateToggle();

async function loadContributions() {
  const calendar = document.querySelector('#calendar');
  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/jhadenn?y=last', {signal: AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('Contribution service unavailable');
    const data = await response.json();
    if (!Array.isArray(data.contributions) || !data.contributions.length) throw new Error('No contribution data');
    const grid = document.createElement('div'); grid.className = 'calendar-grid';
    const colors = ['#1c252b','#39494a','#68796b','#a4b393','#eeecc8'];
    const firstWeekday = new Date(data.contributions[0].date + 'T00:00:00Z').getUTCDay();
    for (let i=0;i<firstWeekday;i++) grid.append(document.createElement('span'));
    for (const day of data.contributions) {
      const square = document.createElement('span'); square.className = 'day';
      square.style.setProperty('--day-color',colors[Math.max(0,Math.min(4,day.level))]);
      square.title = `${day.count} contributions on ${day.date}`;
      square.setAttribute('aria-label',square.title); grid.append(square);
    }
    calendar.replaceChildren(grid); calendar.scrollLeft = calendar.scrollWidth;
    document.querySelector('#contribution-total').textContent = `${data.contributions.reduce((sum,day)=>sum+day.count,0).toLocaleString()} contributions in the last year`;
  } catch {
    const status = document.createElement('p'); status.className = 'calendar-status';
    status.append('Activity is unavailable right now. ');
    const link = document.createElement('a'); link.href = 'https://github.com/jhadenn'; link.textContent = 'View on GitHub ↗';
    status.append(link); calendar.replaceChildren(status);
  }
}
loadContributions();
