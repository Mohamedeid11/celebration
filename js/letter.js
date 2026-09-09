// Phase 2: the letter. "no" runs away and teases her every time she gets close; "yes" is the only way through.
// To swap the roles, swap the two ids below.
import { advance } from './phases.js';
import { sparkles } from './effects.js';
import { TAUNTS } from './data.js';

const YES_MS = 750;
const YES_AFTER = 5; // "yes" stays disabled until "no" has run away this many times

export function init(section) {
  const runner = section.querySelector('#letterNo');
  const opener = section.querySelector('#letterYes');
  const taunt = section.querySelector('#taunt');
  let done = false, i = 0;

  function flee() {
    if (done) return;
    if (++i === YES_AFTER) { opener.disabled = false; opener.classList.add('is-ready'); }
    const r = runner.getBoundingClientRect();
    runner.classList.add('is-running');
    const x = 16 + Math.random() * (innerWidth - r.width - 32);
    const y = 70 + Math.random() * (innerHeight - r.height - 90);
    runner.style.left = `${x}px`;
    runner.style.top = `${y}px`;
    runner.style.rotate = `${(Math.random() - .5) * 26}deg`;
    const t = TAUNTS[(i - 1) % TAUNTS.length];
    taunt.hidden = true;
    void taunt.offsetWidth; // let the bubble go display:none for a moment so its pop animation restarts
    taunt.innerHTML = `<span class="ar">${t.ar}</span><span class="en" lang="en" dir="ltr">${t.en}</span>`;
    taunt.style.left = `${x + r.width / 2}px`;
    taunt.style.top = `${y - 10}px`;
    taunt.hidden = false;
  }

  runner.addEventListener('pointerenter', flee);
  runner.addEventListener('pointerdown', flee);
  runner.addEventListener('click', flee); // keyboard Enter or Space

  opener.addEventListener('click', () => {
    if (done) return;
    done = true;
    opener.disabled = runner.disabled = true;
    taunt.hidden = true;
    const r = opener.getBoundingClientRect();
    sparkles(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => advance('wish'), YES_MS);
  });
}
