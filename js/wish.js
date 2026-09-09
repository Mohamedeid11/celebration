// Phase 3: make a wish. Hold the button, or let the microphone hear the breeze.
import { advance } from './phases.js';
import { confetti } from './effects.js';
import { CANDLES } from './data.js';

const HOLD_STEP_MS = 450; // one candle per step while holding
const MIC_STEP_MS = 350;  // at most one candle per step from the mic
const MIC_LEVEL = 26;     // average frequency level that counts as a blow
const GRANT_MS = 3000;    // pause on the granted wish

export function init(section) {
  const row = section.querySelector('#candles');
  row.innerHTML = Array.from({ length: CANDLES }, () => '<span class="candle"><span class="flame"></span></span>').join('');
  const candles = [...row.children];
  const hint = section.querySelector('#wishHint');
  const hold = section.querySelector('#blowHold');
  const mic = section.querySelector('#blowMic');
  let done = false, holdTimer = 0, stream = null, lastMic = 0;

  function blow() {
    const lit = candles.find((c) => !c.classList.contains('is-out'));
    if (!lit) return;
    lit.classList.add('is-out');
    if (candles.every((c) => c.classList.contains('is-out'))) granted();
  }

  function granted() {
    done = true;
    stopHold();
    stopMic();
    hold.disabled = mic.disabled = true;
    hint.innerHTML = '<span class="ar">تحقّقت أمنيتكِ! ✨</span><span class="en" lang="en" dir="ltr">wish granted!</span>';
    const r = row.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => advance('reasons'), GRANT_MS);
  }

  const startHold = () => { if (done || holdTimer) return; blow(); holdTimer = setInterval(blow, HOLD_STEP_MS); };
  const stopHold = () => { clearInterval(holdTimer); holdTimer = 0; };
  hold.addEventListener('pointerdown', (e) => { hold.setPointerCapture(e.pointerId); startHold(); });
  hold.addEventListener('pointerup', stopHold);
  hold.addEventListener('pointercancel', stopHold);
  hold.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startHold(); } });
  hold.addEventListener('keyup', stopHold);
  hold.addEventListener('blur', stopHold);

  mic.addEventListener('click', async () => {
    if (done || stream) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      hint.innerHTML = '<span class="ar">لم نصل إلى الميكروفون، اضغطي مطوّلاً على الزر بدلاً منه</span><span class="en" lang="en" dir="ltr">no microphone, hold the button instead</span>';
      return;
    }
    const audio = new AudioContext();
    const analyser = audio.createAnalyser();
    analyser.fftSize = 512;
    audio.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    mic.classList.add('is-listening');
    mic.innerHTML = '<span class="ar">🎤 أسمعكِ… انفخي</span><span class="en" lang="en" dir="ltr">listening… blow</span>';
    (function listen() {
      if (!stream) { audio.close(); return; }
      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
      const now = performance.now();
      if (avg > MIC_LEVEL && now - lastMic > MIC_STEP_MS) { lastMic = now; blow(); }
      requestAnimationFrame(listen);
    })();
  });

  function stopMic() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
    mic.classList.remove('is-listening');
  }
}
