// Phase 6, the end. A memory in three beats: each photo appears alone and fades, then all of them
// gather into a slowly turning ring around the words, and the words zoom in and out. It never ends.
import { MEMORY_PHOTOS, MEMORY_MESSAGES } from './data.js';

const INTRO_HOLD_MS = 1200;   // each photo alone at the centre
const INTRO_FADE_MS = 500;    // matches the .intro transition
const RING_STAGGER_MS = 160;  // ring photos fade in one after another
const ORBIT_S = 120;          // one full turn of the ring
const MSG_CYCLE_MS = 8000;    // zoom in, hold, zoom out — one message
const SWAP_MS = 9000;         // one ring slot trades its photo for the next unseen one this often

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (n) => (Math.random() - .5) * 2 * n;
const load = (src) => { const img = new Image(); img.src = src; return img.decode().then(() => src, () => src); };

export function init(section) {
  const sky = section.querySelector('#memSky');
  const head = section.querySelector('#memIntroHead');
  const count = section.querySelector('#memCount');
  const intro = section.querySelector('#memIntro');
  const centre = section.querySelector('#memCenter');
  const msg = section.querySelector('#memMsg');
  const ar = section.querySelector('#memAr');
  const en = section.querySelector('#memEn');
  section.addEventListener('phase:enter', start, { once: true });

  async function start() {
    const small = matchMedia('(max-width: 600px)').matches;
    const n = Math.min(MEMORY_PHOTOS.length, small ? 6 : 10);
    let next = 0;
    const nextSrc = () => `images/${MEMORY_PHOTOS[next++ % MEMORY_PHOTOS.length]}`;
    const first = Array.from({ length: n }, nextSrc); // the first entries in the list open the show

    // 1. one by one, alone, with a countdown that ticks with each photo
    head.hidden = false;
    for (const [k, src] of first.entries()) {
      intro.querySelector('img').src = await load(src);
      count.classList.remove('is-tick');
      void count.offsetWidth; // so the pop animation restarts on every tick
      count.textContent = n - k;
      count.classList.add('is-tick');
      intro.hidden = false; // un-hiding restarts the intro-in animation
      await wait(INTRO_HOLD_MS);
      intro.classList.add('is-out');
      await wait(INTRO_FADE_MS);
      intro.hidden = true;
      intro.classList.remove('is-out');
    }
    head.hidden = true;

    // 2. all together, in a ring that turns
    const slots = first.map((src, i) => {
      const a = (i / n) * Math.PI * 2;
      const fig = document.createElement('figure');
      fig.className = 'ring-photo';
      fig.style.cssText = [
        `--i:${i}`, `--n:${n}`, `--orbit-dur:${ORBIT_S}s`,
        `--fx:calc(${Math.cos(a).toFixed(3)} * var(--rx))`, `--fy:calc(${Math.sin(a).toFixed(3)} * var(--ry))`,
        `--tilt:${jitter(6).toFixed(1)}deg`, `--bdur:${(7 + Math.random() * 6).toFixed(1)}s`,
      ].join(';');
      const img = new Image();
      img.className = 'polaroid';
      img.alt = '';
      img.src = src;
      fig.append(img);
      sky.append(fig);
      setTimeout(() => fig.classList.add('is-in'), i * RING_STAGGER_MS);
      return fig;
    });
    if (MEMORY_PHOTOS.length > n) {
      let k = 0;
      setInterval(() => swap(slots[k++ % n]), SWAP_MS);
    }
    async function swap(fig) {
      const src = await load(nextSrc());
      fig.classList.add('is-swapping');
      setTimeout(() => { fig.querySelector('img').src = src; fig.classList.remove('is-swapping'); }, 900);
    }

    // 3. the words, zooming in and out inside the ring
    let m = 0;
    msg.style.setProperty('--msg-cycle', `${MSG_CYCLE_MS}ms`);
    const show = () => {
      msg.hidden = true;
      void msg.offsetWidth; // let it go display:none for a moment so the zoom animation restarts
      ar.textContent = MEMORY_MESSAGES[m].ar;
      en.textContent = MEMORY_MESSAGES[m].en;
      m = (m + 1) % MEMORY_MESSAGES.length;
      msg.hidden = false;
    };
    centre.hidden = false;
    show();
    setInterval(show, MSG_CYCLE_MS);
  }
}
