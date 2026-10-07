// Дворец — a hall of the palace in Petersburg, the contrast to Диканька: cold scale, mirrors, candles,
// parquet. A long hall seen down its length: tall windows on the left looking out on the winter
// night over the river, mirrors opposite them on the right, paintings in gold frames between; three
// chandeliers down the middle; at the far end, on a dais before the double doors, the armchair. All of
// it painted in daylight colours, pale and cool; the light — the candles, the moon through the
// windows, the warm rooms beyond the doors when they open — is the scene's. Each surface is painted
// flat in its own metres: a wall from its anchor (x along it as seen facing it, y down), a plane from
// above from its centre (y toward the start).
const { clamp, mix, span, hash, noise } = anim;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
function rect(g, x0, y0, x1, y1, c, alpha = 1) {
  g.fillStyle = css(c, alpha);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
}
function poly(g, pts, c, alpha = 1) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = css(c, alpha);
  g.fill();
}

// what the palace is made of, in daylight
const STUCCO = hex('#e4e6e8'); // the walls, a cool white
const PIER = hex('#eceeef'); // the pilasters, a shade lighter
const GOLD = hex('#c8a258');
const GOLD_DARK = hex('#8a6a34');
const OAK = hex('#a8794a');
const OAK_DARK = hex('#7e5632');
const SILVERING = hex('#1a1d24'); // behind a mirror's glass
const CRIMSON = hex('#8c1c28');
const WAX = hex('#f3eee2');
const FLAME = hex('#ffd890');
const SNOW = hex('#eef2fa');
const NIGHT = [hex('#060a1a'), hex('#1c2c5c')];
const MOON = hex('#f4f2ea');
const CITY = hex('#20273c');
const LAMP = hex('#ffc070');

// ── the hall ────────────────────────────────────────────────────────────
// 14 m wide, 10 m high, from the front wall (distance −2) to the end wall (44). Bays of 6 m: windows
// on the left and mirrors on the right at 4, 10 … 40 (BAYS, distances), piers between them.
const HALL = { w: 14, h: 10, front: -2, end: 44 };
const MID = (HALL.front + HALL.end) / 2;
const BAYS = [4, 10, 16, 22, 28, 34, 40];
const PIERS = BAYS.slice(0, -1).map((d) => d + 3);
const WIN = { w: 2.4, sill: 0.8, top: 6.6 }; // a window, and a mirror the same, from the floor
const MIRROR = { w: 2.4, sill: 0.35, top: 6.6 };
const DOORWAY = { w: 3.4, h: 6.4 };
const INTO = 0.3;
// along a side wall, from where it is seen inside: the left wall's x runs away from the start, the
// right wall's toward it
const along = (side, d) => (side === 'l' ? d - MID : MID - d);

// pilasters on the piers and at the corners: lighter strips, gold capitals, a gold line at the base
function pilaster(g, x, h) {
  rect(g, x - 0.4, -h + 0.9, x + 0.4, 0, PIER);
  rect(g, x - 0.48, -h + 0.9, x + 0.48, -h + 0.75, GOLD);
  rect(g, x - 0.4, -0.32, x + 0.4, -0.28, GOLD);
}
// a gold frame round a rectangle (a mirror, a painting, a window): t thick, a darker inner line
function frame(g, x0, y0, x1, y1, t) {
  g.beginPath();
  g.rect(x0 - t, y0 - t, x1 - x0 + 2 * t, y1 - y0 + 2 * t);
  g.rect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = css(GOLD);
  g.fill('evenodd');
  g.strokeStyle = css(GOLD_DARK);
  g.lineWidth = 0.025;
  g.strokeRect(x0 - t * 0.35, y0 - t * 0.35, x1 - x0 + t * 0.7, y1 - y0 + t * 0.7);
}
// The walls, going INTO m on up into the ceiling, so they meet it without a seam. The left: the
// windows cut out. The right: the mirrors' silvering in gold frames. Both: a cornice of gold under the
// ceiling, the dado below, the pilasters on the piers.
function wall(g, e) {
  const side = e.id === 'wall_l' ? 'l' : 'r';
  const L = HALL.end - HALL.front;
  const H = HALL.h;
  g.beginPath();
  g.rect(-L / 2, -H - INTO, L, H + INTO);
  if (side === 'l') for (const d of BAYS) g.rect(along('l', d) - WIN.w / 2, -WIN.top, WIN.w, WIN.top - WIN.sill);
  g.fillStyle = css(STUCCO);
  g.fill('evenodd');
  g.save();
  g.clip('evenodd');
  rect(g, -L / 2, -0.75, L / 2, -0.72, GOLD);
  rect(g, -L / 2, -H, L / 2, -H + 0.5, PIER);
  rect(g, -L / 2, -H + 0.5, L / 2, -H + 0.56, GOLD);
  for (const d of PIERS) pilaster(g, along(side, d), H);
  g.restore();
  for (const d of BAYS) {
    const x = along(side, d);
    if (side === 'l') frame(g, x - WIN.w / 2, -WIN.top, x + WIN.w / 2, -WIN.sill, 0.12);
    else {
      rect(g, x - MIRROR.w / 2, -MIRROR.top, x + MIRROR.w / 2, -MIRROR.sill, SILVERING);
      frame(g, x - MIRROR.w / 2, -MIRROR.top, x + MIRROR.w / 2, -MIRROR.sill, 0.14);
    }
  }
}
// The mirrors' glass: just where the panes are — the engine mirrors the hall in them. Points: each
// mirror ('mirrors#m1' … from the start).
function mirrors(g, e) {
  BAYS.forEach((d, i) => {
    const x = along('r', d);
    rect(g, x - MIRROR.w / 2, -MIRROR.top, x + MIRROR.w / 2, -MIRROR.sill, SILVERING);
    e.at(x, -(MIRROR.top + MIRROR.sill) / 2, `m${i + 1}`);
  });
}
// The windows' glass (the night beyond shows through, the hall mirrored faintly in it), and their
// sashes over it: a frame, bars into small panes. Points: each window ('windows#w1' …).
function panes(g) {
  for (const d of BAYS) {
    const x = along('l', d);
    rect(g, x - WIN.w / 2, -WIN.top, x + WIN.w / 2, -WIN.sill, SNOW);
  }
}
function sashes(g, e) {
  const bar = 0.05;
  BAYS.forEach((d, i) => {
    const x0 = along('l', d) - WIN.w / 2;
    const x1 = x0 + WIN.w;
    const y0 = -WIN.top;
    const y1 = -WIN.sill;
    g.beginPath();
    g.rect(x0, y0, WIN.w, y1 - y0);
    g.rect(x0 + 0.08, y0 + 0.08, WIN.w - 0.16, y1 - y0 - 0.16);
    g.fillStyle = css(STUCCO);
    g.fill('evenodd');
    for (let k = 1; k < 4; k++) {
      const x = x0 + (WIN.w * k) / 4;
      rect(g, x - bar / 2, y0, x + bar / 2, y1, STUCCO);
    }
    for (let k = 1; k < 8; k++) {
      const y = y0 + ((y1 - y0) * k) / 8;
      rect(g, x0, y - bar / 2, x1, y + bar / 2, STUCCO);
    }
    rect(g, x0, y0 + (y1 - y0) * 0.625 - 0.05, x1, y0 + (y1 - y0) * 0.625 + 0.05, STUCCO);
    e.at((x0 + x1) / 2, (y0 + y1) / 2, `w${i + 1}`);
  });
}
// the reveals of the windows through the thick wall, their sills and heads: plain stucco
const stucco = (g) => rect(g, -50, -50, 50, 50, STUCCO);

// The front wall behind the start, plain; the end wall: the doorway in gold, pilasters either side.
function front(g) {
  const W = HALL.w;
  rect(g, -W / 2, -HALL.h, W / 2, 0, STUCCO);
  rect(g, -W / 2, -0.75, W / 2, -0.72, GOLD);
  for (const x of [-3, 3]) pilaster(g, x, HALL.h);
}
function endWall(g, e) {
  const W = HALL.w;
  const H = HALL.h;
  const { w, h } = DOORWAY;
  g.beginPath();
  g.rect(-W / 2, -H, W, H);
  g.rect(-w / 2, -h, w, h);
  g.fillStyle = css(STUCCO);
  g.fill('evenodd');
  g.save();
  g.clip('evenodd');
  rect(g, -W / 2, -0.75, W / 2, -0.72, GOLD);
  rect(g, -W / 2, -H, W / 2, -H + 0.5, PIER);
  rect(g, -W / 2, -H + 0.5, W / 2, -H + 0.56, GOLD);
  for (const x of [-3.4, 3.4]) pilaster(g, x, H);
  g.restore();
  // the doorway's gold surround, an overdoor panel above it
  frame(g, -w / 2, -h, w / 2, 0.2, 0.22);
  rect(g, -w / 2 - 0.3, -h - 1.3, w / 2 + 0.3, -h - 0.5, PIER);
  frame(g, -w / 2 - 0.3, -h - 1.3, w / 2 + 0.3, -h - 0.5, 0.06);
  e.at(0, -h / 2, 'doorway');
}
// A leaf of the double doors, painted from its hinge (the left leaf x 0 → w, the right −w → 0): white,
// two tall gold-lined panels, a gold handle at the meeting edge. They open away into the rooms beyond.
function leaf(g, e) {
  const w = DOORWAY.w / 2;
  const h = DOORWAY.h;
  const [x0, x1] = e.id === 'door_l' ? [0, w] : [-w, 0];
  rect(g, x0, -h, x1, 0, PIER);
  for (const [y0, y1] of [[-h + 0.35, -h * 0.42], [-h * 0.36, -0.35]]) {
    g.strokeStyle = css(GOLD);
    g.lineWidth = 0.04;
    g.strokeRect(x0 + 0.25, y0, w - 0.5, y1 - y0);
  }
  const hx = e.id === 'door_l' ? w - 0.12 : -w + 0.12;
  rect(g, hx - 0.03, -1.2, hx + 0.03, -0.95, GOLD);
  e.at(hx, -1.1, 'handle');
}

// The parquet: big squares of oak, two tones laid alternately, a dark line between, a border along
// the walls (a plane — the hall's floor and the rooms beyond, FLOOR long — from above).
const FLOOR = { depth: 82 };
const SQ = 1.5;
function parquet(g) {
  const W = HALL.w / 2;
  const D = FLOOR.depth / 2;
  rect(g, -W, -D, W, D, OAK_DARK);
  const b = 0.6;
  for (let x = -W + b; x < W - b - 0.01; x += SQ) {
    for (let y = -D; y < D; y += SQ) {
      const odd = (Math.round((x + W - b) / SQ) + Math.round((y + D) / SQ)) % 2;
      rect(g, x + 0.015, y + 0.015, x + SQ - 0.015, y + SQ - 0.015, odd ? OAK : lerp(OAK, OAK_DARK, 0.18));
    }
  }
}
// the ceiling: white, a gold grid of coffers over the hall (a plane over the whole palace — the rooms
// beyond have their own, lower — its middle CEILING metres from the start)
const CEILING = 28;
function ceiling(g) {
  const W = HALL.w / 2;
  rect(g, -50, -50, 50, 50, PIER);
  const y0 = CEILING - HALL.end;
  const y1 = CEILING - HALL.front;
  for (let y = y0; y <= y1; y += 3) rect(g, -W + 1, y - 0.03, W - 1, y + 0.03, GOLD);
  for (const x of [-W + 1, -2.4, 2.4, W - 1]) rect(g, x - 0.03, y0, x + 0.03, y1, GOLD);
}

// ── candles ─────────────────────────────────────────────────────────────
// candles 0…1: the candles lit, from the far end toward us — the chandeliers one after another
// (span of `candles` each), the sconces with the nearest chandelier.
const CHANDELIERS = [8, 20, 32]; // their distances, down the middle; hanging HANG high
const HANG = 6.6;
const litAt = (s, d) => span(clamp(s.candles ?? 1), 0.95 - d / 46, 1.15 - d / 46);
// a candle and its flame, its foot at x, y; k how lit
function candle(g, x, y, k, t, seed) {
  rect(g, x - 0.018, y - 0.16, x + 0.018, y, WAX);
  if (k < 0.01) return;
  const f = 1 + 0.12 * noise(t * 3 + seed, seed);
  g.beginPath();
  g.ellipse(x, y - 0.2, 0.014, 0.04 * f, 0, 0, Math.PI * 2);
  g.fillStyle = css(FLAME, k);
  g.fill();
  const r = 0.12;
  const gr = g.createRadialGradient(x, y - 0.2, 0, x, y - 0.2, r);
  gr.addColorStop(0, css(FLAME, 0.5 * k));
  gr.addColorStop(1, css(FLAME, 0));
  g.fillStyle = gr;
  g.fillRect(x - r, y - 0.2 - r, 2 * r, 2 * r);
}
// The chandeliers: each a part (its own depth) hanging on a rod from the ceiling — two rings of
// candles in gilt bronze, crystal drops; its light 'chandeliers#c1' … (the scene's lights take them
// over), its point the same.
function chandeliers(g, e) {
  const s = e.state;
  const t = e.t;
  CHANDELIERS.forEach((d, i) => {
    const k = litAt(s, d);
    e.part(0, d - CHANDELIERS[0], (pg) => {
      pg.translate(0, -HANG);
      rect(pg, -0.02, -(HALL.h - HANG), 0.02, -0.4, GOLD_DARK);
      for (const [r, y, n] of [[1.05, 0, 14], [0.62, -0.75, 9]]) {
        // the ring (seen from below: its near half, a flat arc), the candles on it
        pg.strokeStyle = css(GOLD);
        pg.lineWidth = 0.045;
        pg.beginPath();
        pg.ellipse(0, y, r, r * 0.16, 0, 0, Math.PI * 2);
        pg.stroke();
        for (let j = 0; j < n; j++) {
          const a = (j / n) * Math.PI * 2 + 0.2 * i;
          const cx = r * Math.cos(a);
          const cy = y + r * 0.16 * Math.sin(a);
          candle(pg, cx, cy, k, t, i * 31 + j);
        }
      }
      // the crystal drops under the lower ring, catching the flames
      for (let j = 0; j < 22; j++) {
        const a = (j / 22) * Math.PI * 2;
        const cx = 0.95 * Math.cos(a);
        const cy = 0.15 + 0.15 * Math.sin(a) + 0.12 * hash(j, 7);
        const drop = [[cx, cy - 0.05], [cx + 0.025, cy], [cx, cy + 0.07], [cx - 0.025, cy]];
        poly(pg, drop, lerp(SNOW, FLAME, 0.3 * k), 0.55 + 0.4 * k);
      }
      // the bowl below
      poly(pg, [[-0.35, 0.05], [0.35, 0.05], [0.12, 0.45], [-0.12, 0.45]], GOLD);
      pg.fillStyle = css(GOLD);
      pg.beginPath();
      pg.arc(0, 0.5, 0.07, 0, Math.PI * 2);
      pg.fill();
      e.light(0, -0.35, 0.9, '#ffcf8c', 0.75 * k, `c${i + 1}`);
      e.at(0, -0.3, `c${i + 1}`);
    }, [-1.3, -(HALL.h - 0.2), 1.3, 0.1]);
  });
}
// Sconces on the piers, three candles on gilt arms each, at the height of a hand raised: parts along
// the wall the element stands by (its id: sconces_l, sconces_r) — those of the piers in SCONCES.
const SCONCES = { sconces_l: PIERS, sconces_r: [7, 19, 31] };
function sconces(g, e) {
  const s = e.state;
  const t = e.t;
  const list = SCONCES[e.id];
  list.forEach((d, i) => {
    const k = litAt(s, d);
    e.part(0, d - list[0], (pg) => {
      pg.translate(0, -2.6);
      rect(pg, -0.03, -0.1, 0.03, 0.35, GOLD);
      pg.strokeStyle = css(GOLD);
      pg.lineWidth = 0.035;
      pg.beginPath();
      pg.moveTo(-0.3, -0.05);
      pg.quadraticCurveTo(-0.3, 0.2, 0, 0.2);
      pg.quadraticCurveTo(0.3, 0.2, 0.3, -0.05);
      pg.stroke();
      for (const [j, x] of [-0.3, 0, 0.3].entries()) candle(pg, x, x === 0 ? -0.12 : -0.05, k, t, 97 * i + j);
      e.light(0, -0.25, 0.45, '#ffcf8c', 0.3 * k, `s${i + 1}`);
    }, [-0.45, -3.1, 0.45, 0.05]);
  });
}

// ── the paintings ───────────────────────────────────────────────────────
// In gold frames on the right wall's piers. `painting` — the one Вакула stands before: a mother with
// her child, as the old masters did — and the colours! the only bright ones in the hall: ultramarine,
// vermilion, gold. Its canvas 'painting#canvas' (the close-up's point).
const CANVAS = { w: 2.2, h: 3, y: 3.7 }; // its middle y m up
const ULTRAMARINE = hex('#1f3f93');
const ULTRA_DEEP = hex('#142a66');
const VERMILION = hex('#b2382c');
const SKIN = hex('#e9cba8');
const OCHRE = hex('#c8963e');
function path(g, pts) {
  // a soft outline through the points: quadratic curves through the middles of its sides
  g.beginPath();
  const n = pts.length;
  const mid = (i) => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2];
  g.moveTo(...mid(n - 1));
  for (let i = 0; i < n; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], ...mid(i));
  g.closePath();
}
function fill(g, pts, c, alpha = 1) {
  path(g, pts);
  g.fillStyle = css(c, alpha);
  g.fill();
}
function halo(g, x, y, r) {
  const gr = g.createRadialGradient(x, y, r * 0.5, x, y, r * 1.6);
  gr.addColorStop(0, css(hex('#f0cf7a'), 0.55));
  gr.addColorStop(1, css(hex('#f0cf7a'), 0));
  g.fillStyle = gr;
  g.fillRect(x - r * 1.6, y - r * 1.6, r * 3.2, r * 3.2);
  g.strokeStyle = css(GOLD);
  g.lineWidth = 0.022;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
}
function painting(g, e) {
  const { w, h } = CANVAS;
  g.translate(0, -CANVAS.y);
  const x0 = -w / 2;
  const y0 = -h / 2;
  // the ground: deep umber, lighter in an arch behind her
  rect(g, x0, y0, -x0, -y0, hex('#22180f'));
  const arch = g.createRadialGradient(0.05, -0.55, 0.1, 0.05, -0.2, 1.5);
  arch.addColorStop(0, css(hex('#8a6430'), 0.9));
  arch.addColorStop(0.5, css(hex('#4a3420'), 0.6));
  arch.addColorStop(1, css(hex('#22180f'), 0));
  g.fillStyle = arch;
  g.fillRect(x0, y0, w, h);
  halo(g, 0.08, -0.68, 0.36);
  // her mantle: from the hood over her head down the shoulders to a broad fall at the bottom
  const mantle = [
    [0.06, -0.97],
    [0.36, -0.9],
    [0.4, -0.5],
    [0.66, -0.26],
    [0.8, 0.5],
    [0.9, 1.5],
    [-0.9, 1.5],
    [-0.74, 0.4],
    [-0.6, -0.24],
    [-0.26, -0.5],
    [-0.2, -0.88],
  ];
  fill(g, mantle, ULTRAMARINE);
  // its light side and its folds
  const lit = [[-0.6, -0.24], [-0.3, -0.1], [-0.42, 0.7], [-0.62, 1.5], [-0.9, 1.5], [-0.74, 0.4]];
  fill(g, lit, lerp(ULTRAMARINE, hex('#6f8fd6'), 0.35));
  fill(g, [[0.4, -0.2], [0.66, -0.26], [0.8, 0.5], [0.9, 1.5], [0.55, 1.5], [0.6, 0.4]], ULTRA_DEEP);
  // the vermilion dress showing between
  fill(g, [[-0.04, -0.42], [0.22, -0.42], [0.2, 0.2], [0.34, 1.5], [-0.16, 1.5], [0.02, 0.25]], VERMILION);
  // a gold star on her shoulder
  g.save();
  g.translate(0.5, -0.12);
  g.fillStyle = css(GOLD);
  g.beginPath();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? 0.018 : 0.05;
    const a = (i / 16) * Math.PI * 2;
    g.lineTo(r * Math.cos(a), r * Math.sin(a));
  }
  g.closePath();
  g.fill();
  g.restore();
  // her face, bent to the child
  g.save();
  g.translate(0.08, -0.64);
  g.rotate(-0.28);
  g.beginPath();
  g.ellipse(0, 0, 0.15, 0.2, 0, 0, Math.PI * 2);
  g.fillStyle = css(SKIN);
  g.fill();
  g.beginPath();
  g.ellipse(0.06, 0.02, 0.08, 0.17, 0, -Math.PI / 2, Math.PI / 2);
  g.fillStyle = css(lerp(SKIN, hex('#9a6a4a'), 0.3));
  g.fill();
  g.restore();
  // the hood's edge over her brow
  fill(g, [[-0.14, -0.86], [0.06, -0.93], [0.3, -0.84], [0.24, -0.78], [0.04, -0.84], [-0.1, -0.76]], ULTRAMARINE);
  // the child on her arm, in ochre, his head against her cheek; her hands holding him
  halo(g, -0.3, -0.5, 0.2);
  fill(g, [[-0.5, -0.36], [-0.12, -0.42], [0.02, -0.1], [-0.06, 0.24], [-0.44, 0.2], [-0.56, -0.1]], OCHRE);
  fill(g, [[-0.5, -0.36], [-0.3, -0.38], [-0.38, 0.0], [-0.56, -0.1]], lerp(OCHRE, hex('#f2d08a'), 0.4));
  g.beginPath();
  g.ellipse(-0.3, -0.5, 0.105, 0.12, 0.2, 0, Math.PI * 2);
  g.fillStyle = css(lerp(SKIN, hex('#f6dcc0'), 0.4));
  g.fill();
  for (const [x, y, r] of [[-0.06, 0.2, 0.09], [-0.5, 0.02, 0.075]]) {
    g.beginPath();
    g.ellipse(x, y, r, r * 0.62, -0.3, 0, Math.PI * 2);
    g.fillStyle = css(SKIN);
    g.fill();
  }
  // the varnish: the light falling across the canvas from the upper left
  const varnish = g.createLinearGradient(x0, y0, -x0, -y0);
  varnish.addColorStop(0, 'rgba(255,240,210,0.08)');
  varnish.addColorStop(1, 'rgba(0,0,0,0.12)');
  g.fillStyle = varnish;
  g.fillRect(x0, y0, w, h);
  frame(g, x0, y0, -x0, -y0, 0.2);
  e.at(0, 0, 'canvas');
}
// the others: a river at sunset (painting2), a dark portrait (painting3) — quiet beside hers
function landscape(g) {
  const w = 2.6;
  const h = 1.8;
  g.translate(0, -4);
  const sky = g.createLinearGradient(0, -h / 2, 0, 0.1);
  sky.addColorStop(0, css(hex('#3b3140')));
  sky.addColorStop(1, css(hex('#d39a5a')));
  g.fillStyle = sky;
  g.fillRect(-w / 2, -h / 2, w, h * 0.6);
  rect(g, -w / 2, 0.1 * h - 0.0, w / 2, h / 2, hex('#2a2a30'));
  rect(g, -w / 2, 0.08, w / 2, 0.12, hex('#e8b070'));
  const shore = [[-w / 2, 0.08], [-0.6, -0.05], [-0.1, 0.02], [0.5, -0.08], [w / 2, 0], [w / 2, 0.1], [-w / 2, 0.1]];
  poly(g, shore, hex('#1d1a20'));
  frame(g, -w / 2, -h / 2, w / 2, h / 2, 0.16);
}
function portrait(g) {
  const w = 1.6;
  const h = 2.1;
  g.translate(0, -3.8);
  rect(g, -w / 2, -h / 2, w / 2, h / 2, hex('#22201e'));
  poly(g, [[-0.62, 1.05], [-0.5, 0.35], [-0.18, 0.15], [0.2, 0.15], [0.52, 0.35], [0.62, 1.05]], hex('#2c3a52'));
  g.beginPath();
  g.ellipse(0, -0.12, 0.2, 0.26, 0, 0, Math.PI * 2);
  g.fillStyle = css(hex('#c9a688'));
  g.fill();
  poly(g, [[-0.22, -0.2], [-0.2, -0.45], [0.2, -0.45], [0.24, -0.2], [0.12, -0.34], [-0.1, -0.34]], hex('#ddd6cc'));
  rect(g, -0.5, 0.55, 0.5, 0.6, GOLD);
  frame(g, -w / 2, -h / 2, w / 2, h / 2, 0.15);
}

// ── at the end: the dais, the armchair ──────────────────────────────────
// The dais: two steps of crimson cloth, a gold edge (its top a plane, its fronts cards). The armchair
// facing down the hall: gilt frame, crimson back and seat; 'chair#seat'.
function dais(g) {
  rect(g, -10, -10, 10, 10, CRIMSON);
}
function riser(g, e) {
  const w = e.id === 'dais_step' ? 6 : 4.6;
  rect(g, -w / 2, -0.15, w / 2, 0, lerp(CRIMSON, OAK_DARK, 0.3));
  rect(g, -w / 2, -0.16, w / 2, -0.13, GOLD);
}
function chair(g, e) {
  // legs, the seat's front rail, the arms, the tall back with its crest
  for (const x of [-0.42, 0.36]) rect(g, x, -0.5, x + 0.06, 0, GOLD);
  rect(g, -0.46, -0.56, 0.46, -0.46, GOLD);
  rect(g, -0.42, -0.62, 0.42, -0.54, CRIMSON);
  for (const s of [-1, 1]) {
    poly(g, [[s * 0.42, -0.6], [s * 0.5, -0.9], [s * 0.56, -0.95], [s * 0.56, -0.86], [s * 0.48, -0.6]], GOLD);
  }
  poly(g, [[-0.4, -0.6], [-0.42, -1.55], [-0.2, -1.78], [0, -1.86], [0.2, -1.78], [0.42, -1.55], [0.4, -0.6]], GOLD);
  const cushion = [[-0.32, -0.7], [-0.34, -1.5], [-0.16, -1.68], [0, -1.74], [0.16, -1.68], [0.34, -1.5], [0.32, -0.7]];
  poly(g, cushion, CRIMSON);
  poly(g, [[-0.1, -1.86], [0, -2.02], [0.1, -1.86]], GOLD);
  e.at(0, -0.62, 'seat');
  e.at(0, -1.3);
}
function seat(g) {
  rect(g, -10, -10, 10, 10, CRIMSON);
}

// ── beyond the doors ────────────────────────────────────────────────────
// The rooms beyond, one through another (an enfilade): the first a room of its own (its walls, the
// light in it — the scene's, on as the doors open), past it doorways each in a wall of its own — parts,
// each at its depth — lit warm, dimmer the farther.
function beyond(g) {
  rect(g, -50, -50, 50, 50, lerp(STUCCO, LAMP, 0.25));
}
const ENFILADE = [0, 9, 18];
function enfilade(g, e) {
  ENFILADE.forEach((dz, i) => {
    e.part(0, dz, (pg) => {
      pg.beginPath();
      pg.rect(-4, -7, 8, 7);
      pg.rect(-1.5, -5.2, 3, 5.2);
      pg.fillStyle = css(lerp(lerp(STUCCO, LAMP, 0.35), NIGHT[0], 0.18 * i));
      pg.fill('evenodd');
      frame(pg, -1.5, -5.2, 1.5, 0, 0.14);
      if (i === ENFILADE.length - 1) rect(pg, -1.5, -5.2, 1.5, 0, lerp(LAMP, NIGHT[0], 0.55));
    }, [-4.2, -7.1, 4.2, 0.05]);
  });
}

// ── outside ─────────────────────────────────────────────────────────────
// The winter night over the river, all round (seen through the windows, on the left): deep blue, the
// stars, the moon (its point 'sky#moon' — the moonlight comes from there).
const MOON_AT = { bearing: -62, up: 0.62, r: 0.03 };
function sky(g, e) {
  const s = e.state;
  const gr = g.createLinearGradient(0, -0.35, 0, 0.62);
  gr.addColorStop(0, css(NIGHT[0]));
  gr.addColorStop(1, css(NIGHT[1]));
  g.fillStyle = gr;
  g.fillRect(-0.3, -0.35, e.aspect + 0.6, 1.6);
  g.fillStyle = css([0.9, 0.93, 1], 0.7);
  for (let i = 0; i < 260; i++) {
    const y = -0.35 + 0.8 * hash(i, 2) ** 1.3;
    g.beginPath();
    g.arc(e.aspect * hash(i, 1), y, 0.001 + 0.0015 * hash(i, 3), 0, Math.PI * 2);
    g.fill();
  }
  const k = clamp(s.moon ?? 1);
  const x = e.aspect / 2 + (MOON_AT.bearing / 360) * e.aspect;
  const y = 0.5 - MOON_AT.up;
  if (k > 0.01) {
    const halo = g.createRadialGradient(x, y, 0, x, y, 0.2);
    halo.addColorStop(0, css(hex('#9db4ec'), 0.35 * k));
    halo.addColorStop(1, css(hex('#9db4ec'), 0));
    g.fillStyle = halo;
    g.fillRect(x - 0.2, y - 0.2, 0.4, 0.4);
    g.beginPath();
    g.arc(x, y, MOON_AT.r, 0, Math.PI * 2);
    g.arc(x + 0.45 * MOON_AT.r, y - 0.3 * MOON_AT.r, 0.85 * MOON_AT.r, 0, Math.PI * 2, true);
    g.fillStyle = css(MOON, k);
    g.fill('evenodd');
    e.at(x, y, 'moon');
  }
}
// the snow on the embankment and the river's ice beyond the windows (a plane round the palace — the
// floor's FLOOR left out)
function snow(g) {
  g.beginPath();
  g.rect(-1e3, -1e3, 2e3, 2e3);
  g.rect(-8, -FLOOR.depth / 2, 16, FLOOR.depth);
  g.fillStyle = css(SNOW);
  g.fill('evenodd');
}
// the far bank across the river: a long low line of the city, a thin gold spire, the lamps along the
// quay (the element glows: its lamps keep their own light)
function city(g, e) {
  rect(g, -400, -14, 400, 0, CITY);
  for (let i = 0; i < 40; i++) {
    const x = -400 + 800 * hash(i, 11);
    const h = 4 + 10 * hash(i, 12);
    rect(g, x, -14 - h, x + 20 + 40 * hash(i, 13), -14, CITY);
  }
  poly(g, [[38, -14], [41, -14], [40.2, -58], [39.6, -84], [39, -58]], CITY);
  rect(g, 39.45, -86, 39.75, -78, GOLD);
  for (let i = 0; i < 70; i++) {
    const x = -400 + 800 * (i / 70) + 4 * hash(i, 14);
    const k = 0.6 + 0.4 * hash(i, 15) * (0.85 + 0.15 * Math.sin(e.t * 0.7 + i));
    const gr = g.createRadialGradient(x, -3, 0, x, -3, 3);
    gr.addColorStop(0, css(LAMP, k));
    gr.addColorStop(0.15, css(LAMP, 0.5 * k));
    gr.addColorStop(1, css(LAMP, 0));
    g.fillStyle = gr;
    g.fillRect(x - 3, -6, 6, 6);
  }
}
// snow falling past the windows, slowly, lit by them
function snowfall(g, e) {
  const t = e.t;
  const W = 23;
  const top = 9;
  g.fillStyle = css(SNOW, 0.85);
  for (let i = 0; i < 520; i++) {
    const z = hash(i, 21);
    const x = ((hash(i, 22) * 2 * W + 0.3 * noise(t * 0.2 + i, 23) + 0.15 * t) % (2 * W)) - W;
    const y = ((((hash(i, 24) * top + (0.35 + 0.4 * z) * t) % top) + top) % top) - top;
    g.beginPath();
    g.arc(x, y, 0.012 + 0.022 * z, 0, Math.PI * 2);
    g.fill();
  }
}

return {
  wall, mirrors, panes, sashes, stucco, front, endWall, leaf, parquet, ceiling,
  chandeliers, sconces, painting, landscape, portrait, dais, riser, chair, seat,
  beyond, enfilade, sky, snow, city, snowfall,
};
