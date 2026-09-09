// Confetti, sparkles, and the ambient twinkle. One canvas, one loop that stops when it is empty.

const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
const CONFETTI = ['#e8c46e', '#eaa6c6', '#f8df94', '#d98bb5', '#fff3d6', '#b98a2b'];
const SPARKLE = ['#fff6d6', '#f8df94', '#e8c46e', '#ffffff'];
let parts = [];
let raf = 0;

function fit() { canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', fit);
fit();

function spawn(count, make) {
  for (let i = 0; i < count; i++) parts.push(make());
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  parts = parts.filter((p) => p.life > 0);
  for (const p of parts) {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .99; p.rot += p.spin; p.life -= p.decay;
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillStyle = p.color;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  raf = parts.length ? requestAnimationFrame(tick) : 0;
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function confetti(x, y) {
  spawn(140, () => {
    const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, g: .18, w: 6 + Math.random() * 6, h: 3 + Math.random() * 5,
      rot: Math.random() * 6, spin: (Math.random() - .5) * .3, color: pick(CONFETTI), life: 1.4, decay: .011 };
  });
}

export function sparkles(x, y) {
  spawn(70, () => {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 4, size = 2 + Math.random() * 4;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, g: .03, w: size, h: size,
      rot: Math.PI / 4, spin: .08, color: pick(SPARKLE), life: 1.2, decay: .016 };
  });
}

export function ambient(host) {
  const n = innerWidth < 600 ? 16 : 30;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--s:${1 + Math.random() * 2.2}px;--d:${2 + Math.random() * 4}s;--delay:-${Math.random() * 6}s`;
    frag.append(s);
  }
  host.append(frag);
}
