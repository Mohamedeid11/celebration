// Walks the whole flow in headless Chrome over the DevTools protocol, screenshots each state,
// and fails if any check fails or the console is not clean. No dependencies: Node 22+ and Chrome.
//
//   node tools/walkthrough.mjs [url] [WxH] [outDir]
//   SNAP=drag|click|key   which of the three crown snap paths to use (default drag)
//   MIC=1                 blow the candles with the (fake) microphone instead of the hold button
//   CHROME=path           chrome executable
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const URL = process.argv[2] || 'http://127.0.0.1:8765/';
const [W, H] = (process.argv[3] || '1280x900').split('x').map(Number);
const OUT = process.argv[4] || join(tmpdir(), 'marwa-shots');
const SNAP = process.env.SNAP || 'drag';
const MIC = process.env.MIC === '1';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9300 + Math.floor(Math.random() * 600);
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), `marwa-walk-${PORT}`)}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required',
  `--window-size=${W},${H}`, 'about:blank',
], { stdio: 'ignore' });
process.on('exit', () => chrome.kill());

let targets;
for (let i = 0; i < 60 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); } catch { await sleep(250); }
}
if (!targets) throw new Error('chrome did not start');
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let seq = 0;
const pending = new Map();
const logs = [];
ws.onmessage = ({ data }) => {
  const m = JSON.parse(data);
  if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') logs.push(`console.${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? '').join(' ')}`);
  if (m.method === 'Runtime.exceptionThrown') logs.push(`exception: ${m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text}`);
  if (m.method === 'Log.entryAdded') logs.push(`${m.params.entry.level}: ${m.params.entry.text} ${m.params.entry.url || ''}`);
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, (m) => (m.error ? rej(new Error(`${method}: ${m.error.message}`)) : res(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const js = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
const rect = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
  return { l: r.left, t: r.top, w: r.width, h: r.height, b: r.bottom, x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
const shown = (id) => js(`!document.getElementById(${JSON.stringify(id)}).hidden`);
const waitFor = async (expr, ms = 8000) => {
  const t = Date.now();
  while (Date.now() - t < ms) { if (await js(expr)) return Date.now() - t; await sleep(100); }
  throw new Error(`timeout waiting for ${expr}`);
};
const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 });
const click = async (x, y) => { await mouse('mouseMoved', x, y); await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); };
const drag = async (from, to, steps = 14) => {
  await mouse('mouseMoved', from.x, from.y); await mouse('mousePressed', from.x, from.y);
  for (let i = 1; i <= steps; i++) { await mouse('mouseMoved', from.x + (to.x - from.x) * i / steps, from.y + (to.y - from.y) * i / steps); await sleep(25); }
  await mouse('mouseReleased', to.x, to.y);
};
const press = async (key, code, vk) => {
  for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
};
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
};
const scrollTo = (sel) => js(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({ block: 'center', behavior: 'instant' })`);
const fails = [];
const check = (ok, msg) => { console.log(`${ok ? ' ok ' : 'FAIL'}  ${msg}`); if (!ok) fails.push(msg); };

await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 600 });
const t0 = Date.now();
await send('Page.navigate', { url: URL });
await waitFor(`document.getElementById('gift') && !document.getElementById('present').hidden`);
await sleep(700);
await shot('01-present-idle');

// 1. present: the gift flees, then comes home
let g = await rect('#gift');
await mouse('mouseMoved', g.x, g.y); await sleep(450);
let g2 = await rect('#gift');
check(Math.hypot(g2.x - g.x, g2.y - g.y) > 40, 'gift flees from a hover');
await click(g2.x, g2.y); await sleep(450);
check((await shown('present')) && !(await js(`document.getElementById('gift').classList.contains('is-open')`)), 'clicking during the chase does not open it');
await shot('02-gift-fleeing');
await waitFor(`document.getElementById('gift').classList.contains('is-catchable')`, 9000);
const catchAt = Date.now() - t0;
check(catchAt > 4500 && catchAt < 7500, `gift becomes catchable ~5s after load (${catchAt}ms)`);
await sleep(600);
g = await rect('#gift');
check(Math.abs(g.x - W / 2) < 8, 'gift returns to the centre');
await shot('03-gift-catchable');
await click(g.x, g.y); await sleep(250);
await shot('04-gift-opening-confetti');
await waitFor(`!document.getElementById('letter').hidden`, 3000);

// 2. letter: "no" runs away and teases, "yes" wakes up after five escapes and advances
await sleep(800); await shot('05-letter');
check(await js(`document.getElementById('letterYes').disabled`), 'yes starts disabled');
await scrollTo('#letterNo');
const n1 = await rect('#letterNo');
await mouse('mouseMoved', n1.x, n1.y); await sleep(450);
let nPos = await rect('#letterNo');
check(Math.hypot(nPos.x - n1.x, nPos.y - n1.y) > 40, 'no button runs away');
const firstTaunt = await js(`document.getElementById('taunt').hidden ? '' : document.getElementById('taunt').textContent`);
check(Boolean(firstTaunt), 'taunt bubble shows');
await mouse('mouseMoved', nPos.x, nPos.y); await sleep(450);
check((await js(`document.getElementById('taunt').textContent`)) !== firstTaunt, 'the taunt changes on the next try');
await shot('06-letter-taunt');
for (let k = 2; k < 5; k++) { nPos = await rect('#letterNo'); await mouse('mouseMoved', nPos.x, nPos.y); await sleep(400); }
check(!(await js(`document.getElementById('letterYes').disabled`)), 'yes is enabled after five escapes');
await scrollTo('#letterYes');
const yb = await rect('#letterYes'); await click(yb.x, yb.y);
await waitFor(`!document.getElementById('wish').hidden`, 3000);

// 3. wish: blow the candles
await sleep(800); await shot('07-wish-candles-lit');
const allOut = `document.querySelectorAll('#candles .candle.is-out').length === document.querySelectorAll('#candles .candle').length`;
if (MIC) {
  const mb = await rect('#blowMic'); await click(mb.x, mb.y);
  await waitFor(allOut, 8000).catch(() => {});
  check(await js(allOut), 'microphone blows out every candle');
} else {
  const hb = await rect('#blowHold');
  await mouse('mouseMoved', hb.x, hb.y); await mouse('mousePressed', hb.x, hb.y);
  await sleep(450 * 5 + 200);
  await mouse('mouseReleased', hb.x, hb.y);
  check(await js(allOut), 'holding the button blows out every candle');
}
await sleep(300); await shot('08-wish-granted');
const tw = Date.now();
await waitFor(`!document.getElementById('reasons').hidden`, 6000);
check(Date.now() - tw > 1500, 'reasons arrives after a pause on the granted wish');

// 4. reasons: flip every card
await sleep(800); await shot('09-reasons-front');
const count = await js(`document.querySelectorAll('#cards .card').length`);
check(count >= 7, `${count} reason cards rendered from the data list`);
let tr = 0;
for (let i = 0; i < count; i++) {
  await scrollTo(`#cards .card:nth-child(${i + 1})`);
  const c = await rect(`#cards .card:nth-child(${i + 1})`);
  await click(c.x, c.y);
  tr = Date.now();
  await sleep(i === count - 2 ? 900 : 250);
  if (i === count - 2) await shot('10-reasons-flipping');
}
await sleep(800); await shot('11-reasons-all-flipped');
await waitFor(`!document.getElementById('crown').hidden`, 5000);
check(Date.now() - tr > 1500, `crown arrives after a pause on the flipped cards (${Date.now() - tr}ms after the last flip)`);

// 5. crown: drag / click / key, then measure where it landed
await sleep(900); await shot('12-crown-initial');
const REST = await js(`import('./js/crown.js').then((m) => m.REST)`);
const f = await rect('#crownFrame'), c = await rect('#crownEl'), head = await rect('#crown .title-ar');
if (SNAP === 'drag') await drag({ x: c.x, y: c.y }, { x: f.l + REST.x * f.w + 18, y: f.t + REST.y * f.h - c.h / 2 + 14 }); // a little off on purpose
else if (SNAP === 'click') await click(c.x, c.y);
else { await js(`document.getElementById('crownEl').focus()`); await press('Enter', 'Enter', 13); }
await sleep(700);
const c2 = await rect('#crownEl');
const restY = f.t + REST.y * f.h;
check(await js(`document.getElementById('crownEl').classList.contains('is-fitted')`), `snap fired via ${SNAP}`);
check(Math.abs(c2.b - restY) < 3, `crown bottom rests at ${Math.round(REST.y * 100)}% of the frame (off by ${(c2.b - restY).toFixed(1)}px)`);
check(Math.abs(c2.x - (f.l + REST.x * f.w)) < 3, `crown centred on the head (off by ${(c2.x - (f.l + REST.x * f.w)).toFixed(1)}px)`);
check(c2.t > head.b, `crown clears the heading (gap ${(c2.t - head.b).toFixed(0)}px)`);
await shot('13-crown-fitted');
const tc = Date.now();
await waitFor(`!document.getElementById('memories').hidden`, 6000);
check(Date.now() - tc > 1800, 'memories arrives after a pause on the fitted crown');

// 6. memories: photos arrive one by one, gather into a turning ring, the words zoom in and out
await waitFor(`!document.getElementById('memIntro').hidden`, 5000);
await sleep(700); await shot('14-memories-intro');
const c1 = Number(await js(`document.getElementById('memCount').textContent`));
await waitFor(`Number(document.getElementById('memCount').textContent) === ${c1 - 1}`, 4000);
check(c1 > 1, `countdown starts at ${c1} and ticks down with the next photo`);
const introMs = await waitFor(`document.querySelectorAll('.ring-photo.is-in').length > 0
  && document.querySelectorAll('.ring-photo.is-in').length === document.querySelectorAll('.ring-photo').length`, 40000);
check(introMs > 3000, `ring assembled after the one-by-one intro (${(introMs / 1000).toFixed(1)}s)`);
await sleep(800); await shot('15-memories-ring');
const pos = () => js(`[...document.querySelectorAll('.ring-photo')].map((d) => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })`);
const p1 = await pos();
const m1 = await js(`document.getElementById('memAr').textContent`);
await sleep(4000);
const p2 = await pos();
const moves = p1.map((p, i) => [p2[i][0] - p[0], p2[i][1] - p[1]]);
check(p1.length > 0 && moves.every(([dx, dy]) => Math.hypot(dx, dy) > 1), `${p1.length} photos in the ring, all of them turning`);
await sleep(5000);
const m2 = await js(`document.getElementById('memAr').textContent`);
check(Boolean(m1 && m2) && m1 !== m2, 'the words cycle');
check(await js(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), 'no horizontal overflow');
await shot('16-memories-later');

console.log(`\nconsole: ${logs.length ? '\n  ' + logs.join('\n  ') : 'clean'}`);
check(logs.length === 0, 'browser console is clean');
console.log(fails.length ? `\n${fails.length} check(s) failed` : '\nall checks passed', `— screenshots in ${OUT}`);
ws.close();
chrome.kill();
process.exit(fails.length ? 1 : 0);
