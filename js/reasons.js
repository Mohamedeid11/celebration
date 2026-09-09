// Phase 4: reasons. Flip every card face up; the count comes from the data, never a literal.
import { advance } from './phases.js';
import { sparkles } from './effects.js';
import { REASONS } from './data.js';

const DONE_MS = 1500;

export function init(section) {
  const grid = section.querySelector('#cards');
  grid.innerHTML = REASONS.map((r) => `
    <button type="button" class="card" aria-pressed="false">
      <span class="card-inner">
        <span class="card-face card-front"><span class="ar">اضغطي لتكشفي</span><span class="en" lang="en" dir="ltr">tap to reveal</span></span>
        <span class="card-face card-back"><span class="ar">${r.ar}</span><span class="en" lang="en" dir="ltr">${r.en}</span></span>
      </span>
    </button>`).join('');
  const cards = [...grid.children];

  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const up = card.classList.toggle('is-flipped'); // flipping back down counts down again
    card.setAttribute('aria-pressed', String(up));
    if (!cards.every((c) => c.classList.contains('is-flipped'))) return;
    cards.forEach((c) => { c.disabled = true; });
    const r = card.getBoundingClientRect();
    sparkles(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => advance('crown'), DONE_MS);
  });
}
