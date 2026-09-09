// The phase contract: one section per phase, hidden by default, and a phase reveals
// only the phase after it by calling advance('<id>'). Nothing else ever un-hides a section.

export const FADE_MS = 600; // matches --fade in css/style.css

export function advance(nextId) {
  const current = document.querySelector('.phase:not([hidden])');
  const next = document.getElementById(nextId);
  if (!next) { console.error(`[marwa] no phase "${nextId}"`); return; }
  current?.classList.add('is-leaving');
  setTimeout(() => {
    if (current) current.hidden = true;
    next.hidden = false;
    scrollTo(0, 0);
    next.dispatchEvent(new CustomEvent('phase:enter'));
  }, FADE_MS);
}
