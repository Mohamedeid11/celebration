// Phase 1: the present. The gift dodges for FLEE_MS, then walks home and opens on click.
import { advance } from './phases.js';
import { confetti } from './effects.js';

const FLEE_MS = 5000; // wall clock, not a dodge count: doing nothing still unlocks it
const OPEN_MS = 750;  // lid pop before the next phase

export function init(section) {
  const gift = section.querySelector('#gift');
  const label = section.querySelector('#giftLabel');
  let catchable = false, opened = false;

  function flee() {
    if (catchable) return;
    const r = gift.getBoundingClientRect();
    gift.style.translate = '0 0';
    gift.style.left = `${12 + Math.random() * (innerWidth - r.width - 24)}px`;
    gift.style.top = `${12 + Math.random() * (innerHeight - r.height - 24)}px`;
  }

  gift.addEventListener('pointerenter', flee);
  gift.addEventListener('pointerdown', flee);
  gift.addEventListener('click', () => {
    if (!catchable) return flee(); // keyboard Enter during the chase
    if (opened) return;
    opened = true;
    const r = gift.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    gift.classList.remove('is-catchable');
    gift.classList.add('is-open');
    setTimeout(() => advance('letter'), OPEN_MS);
  });

  setTimeout(() => {
    catchable = true;
    gift.style.cssText = ''; // back to the centre
    gift.classList.add('is-catchable');
    gift.setAttribute('aria-label', 'الهدية صارت لكِ، افتحيها');
    label.innerHTML = '<span class="ar">صارت لكِ. افتحيني! 🎁</span><span class="en" lang="en" dir="ltr">it\'s yours. open me!</span>';
  }, FLEE_MS);
}
