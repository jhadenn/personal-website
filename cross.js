// Extrude the existing ASCII artwork into a stack of planes in 3D space.
const artwork = document.querySelector('.ascii-cross');
const backdrop = document.querySelector('.cross-backdrop');
const scene = document.createElement('div');
scene.className = 'cross-scene';
const model = document.createElement('div');
model.className = 'cross-model';
model.tabIndex = 0;
model.setAttribute('role', 'group');
model.setAttribute('aria-label', '3D ASCII cross. Drag or use arrow keys to rotate. Double-click or press Home to reset.');
model.title = 'Drag to rotate · double-click to reset';
backdrop.removeAttribute('aria-hidden');
artwork.before(scene);
scene.append(model);
for (let depth = -12; depth <= 12; depth += 2) {
  const layer = artwork.cloneNode(true);
  layer.setAttribute('aria-hidden', 'true');
  layer.className = 'cross-layer';
  layer.style.transform = `translateZ(${depth}px)`;
  layer.style.color = Math.abs(depth) === 12 ? '#dbd9cd' : '#55554e';
  model.append(layer);
}
artwork.remove();
let x = -8, y = -16;
let drag = null;
function render() {
  model.style.transform = `rotateZ(-18deg) rotateX(${x}deg) rotateY(${y}deg)`;
}
function reset() { x = -8; y = -16; render(); }
model.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  model.setPointerCapture(event.pointerId);
  model.classList.add('dragging');
  model.focus({ preventScroll: true });
});
model.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  y += (event.clientX - drag.x) * 0.5;
  x -= (event.clientY - drag.y) * 0.5;
  drag.x = event.clientX; drag.y = event.clientY;
  render();
});
function stopDrag() { drag = null; model.classList.remove('dragging'); }
model.addEventListener('pointerup', stopDrag);
model.addEventListener('pointercancel', stopDrag);
model.addEventListener('lostpointercapture', stopDrag);
model.addEventListener('dblclick', reset);
model.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Home') return reset();
  if (event.key === 'ArrowLeft') y -= 10;
  if (event.key === 'ArrowRight') y += 10;
  if (event.key === 'ArrowUp') x += 10;
  if (event.key === 'ArrowDown') x -= 10;
  render();
});
render();
