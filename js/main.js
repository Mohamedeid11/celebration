// Boot: fetch the sections, wire one module per phase, reveal the first. Order here is the flow.
import { loadSections } from './load-sections.js';
import { ambient } from './effects.js';
import * as present from './gift.js';
import * as letter from './letter.js';
import * as wish from './wish.js';
import * as reasons from './reasons.js';
import * as crown from './crown.js';
import * as memories from './memories.js';

const PHASES = { present, letter, wish, reasons, crown, memories };
const stage = document.getElementById('stage');

ambient(document.getElementById('ambient'));

try {
  await loadSections(Object.keys(PHASES), stage);
} catch (err) {
  document.getElementById('serveError').hidden = false; // the card is static markup in index.html
  throw err;
}

for (const [id, mod] of Object.entries(PHASES)) mod.init(document.getElementById(id));
document.getElementById('present').hidden = false;
