// Phase 5: the crown. Drag it onto her head, click it, or press Enter/Space: all three call fit().
import { advance } from './phases.js';
import { sparkles } from './effects.js';

// Where the crown comes to rest, as fractions of the photo frame:
//   x — horizontal centre of the crown
//   y — where the crown's bottom edge sits (the head starts at ~3% in images/person-nobg.png)
// Tune these two numbers if the photo changes. Nothing else in the maths knows about the head.
export const REST = { x: 0.50, y: 0.12 };
const SNAP_RADIUS = 100; // px between the crown's bottom-centre and REST that counts as "on the head"
const CLICK_MAX = 6;     // px; a shorter drag is a plain click
const DONE_MS = 2900;

export function init(section) {
  const crown = section.querySelector('#crownEl');
  const frame = section.querySelector('#crownFrame');
  const hint = section.querySelector('#crownHint');
  let pos = { x: 0, y: 0 }; // current translate from the crown's slot in the dock
  let start = null;         // pointer drag in progress
  let fitted = false;

  const move = (x, y) => { pos = { x, y }; crown.style.translate = `${x}px ${y}px`; };
  const restPoint = () => { const f = frame.getBoundingClientRect(); return { x: f.left + REST.x * f.width, y: f.top + REST.y * f.height }; };
  const bottomCentre = () => { const c = crown.getBoundingClientRect(); return { x: c.left + c.width / 2, y: c.bottom, h: c.height }; };

  function fit() {
    if (fitted) return;
    fitted = true;
    start = null;
    crown.classList.remove('is-dragging');
    const rest = restPoint(), c = bottomCentre();
    move(pos.x + rest.x - c.x, pos.y + rest.y - c.y);
    crown.classList.add('is-fitted');
    frame.classList.add('is-fitted');
    crown.setAttribute('aria-label', 'التاج على رأسكِ');
    hint.innerHTML = '<span class="ar">على رأسكِ تماماً 👑✨</span><span class="en" lang="en" dir="ltr">perfect fit</span>';
    setTimeout(() => sparkles(rest.x, rest.y - c.h / 2), 450);
    setTimeout(() => advance('memories'), DONE_MS);
  }

  crown.addEventListener('pointerdown', (e) => {
    if (fitted) return;
    crown.setPointerCapture(e.pointerId);
    start = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    crown.classList.add('is-dragging');
  });
  crown.addEventListener('pointermove', (e) => {
    if (!start) return;
    move(start.x + e.clientX - start.px, start.y + e.clientY - start.py);
  });
  crown.addEventListener('pointerup', (e) => {
    if (!start) return;
    const travelled = Math.hypot(e.clientX - start.px, e.clientY - start.py);
    start = null;
    crown.classList.remove('is-dragging');
    const rest = restPoint(), c = bottomCentre();
    if (travelled < CLICK_MAX || Math.hypot(c.x - rest.x, c.y - rest.y) < SNAP_RADIUS) fit();
    else move(0, 0); // float back to the dock
  });
  crown.addEventListener('pointercancel', () => { start = null; crown.classList.remove('is-dragging'); move(0, 0); });
  crown.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fit(); }
  });
}
