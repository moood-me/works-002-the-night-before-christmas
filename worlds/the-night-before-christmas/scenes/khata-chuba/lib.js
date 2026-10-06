// Хата Чуба — the room, painted in its daylight colours; the scene's light (lamp, stove, the window,
// the open door, light.looks) makes the evening, the night, the morning. The room is cards and
// planes: walls, the stove's faces, the bench's and the table's boards stand turned their own way
// (`facing`), tops, the floor and the ceiling are planes. Each is painted in its own metres: a card
// from its anchor (x along it as seen facing it, y down), a plane from above from its centre.
const { clamp, mix, hash } = anim;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;

// what things are made of, in daylight
const LIME = hex('#ebe7de'); // whitewash
const CLAY = hex('#a8927a'); // the clay floor
const WOOD = hex('#6e5644');
const DARK = hex('#3e3129');
const LINEN = hex('#f2eee6');
const RED = hex('#a3352c');
const INK = hex('#2b2523');
const SOOT = hex('#2a2422');
const SNOW = hex('#eef2fa');
const BRASS = hex('#b08a4e');
const FLAME = hex('#ffd08a');
const FIRE = hex('#ff8a3c');
const FROST = hex('#eef3fa');
const ICE_LINE = hex('#9fb2cc');
const SKY_NIGHT = [hex('#0b1330'), hex('#24376c')];
const SKY_MORNING = [hex('#7f9fd2'), hex('#dfe8f4')];
const SKY_STORM = hex('#161b2c');

function rect(g, x0, y0, x1, y1, c, alpha = 1) {
  g.fillStyle = css(c, alpha);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
}

// ── the room ────────────────────────────────────────────────────────────
// Walls: [width, height, holes [x0, y0, x1, y1] in the wall's own metres, seen from inside]. The
// back wall has the door and, over the table, the window.
const WALLS = {
  wall_back: [6.4, 2.5, [[-1.15, -1.85, -0.2, 0], [1.575, -1.75, 2.325, -0.95]]],
  wall_left: [6.6, 2.5, []],
  wall_right: [6.6, 2.5, []],
  wall_front: [6.4, 2.5, []],
};
// the window's opening, from its middle — its glass, frame and frost paint over it
const WINDOW = { x0: -0.375, y0: -1.75, x1: 0.375, y1: -0.95 };
// the openings go through the wall (0.35 m, scene.json): their sides (откоси) are whitewashed too

// a whitewashed wall with its openings cut out, a clay band along the floor
function wall(g, e) {
  const [w, h, holes] = WALLS[e.id];
  g.beginPath();
  g.rect(-w / 2, -h, w, h);
  for (const [x0, y0, x1, y1] of holes) g.rect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = css(LIME);
  g.fill('evenodd');
  g.save();
  g.clip('evenodd');
  rect(g, -w / 2, -0.12, w / 2, 0, lerp(LIME, CLAY, 0.55));
  g.restore();
}

// the clay floor; a woven runner from the door toward the front
function floor(g) {
  rect(g, -10, -10, 10, 10, CLAY);
  const x0 = -0.95;
  const x1 = -0.25;
  rect(g, x0, -3.2, x1, 2.6, lerp(LINEN, CLAY, 0.35));
  for (let y = -3.05; y < 2.5; y += 0.42) rect(g, x0, y, x1, y + 0.05, RED, 0.55);
}
// ── the stove ───────────────────────────────────────────────────────────
// White, on the left: its front (the mouth, the fire in it, the niche under it), its side toward
// the room, its top (the лежанка, a plane), the flue up to the ceiling.
function stove(g, e) {
  rect(g, -0.9, -1.95, 0.9, 0, LIME);
  rect(g, -0.9, -0.1, 0.9, 0, lerp(LIME, CLAY, 0.5));
  // the ledge (припічок) under the mouth
  rect(g, -0.9, -0.62, 0.9, -0.56, lerp(LIME, DARK, 0.18));
  // the mouth (чело): an arch, dark inside, the fire low in it
  g.beginPath();
  g.moveTo(-0.32, -0.62);
  g.lineTo(-0.32, -1.02);
  g.arc(0, -1.02, 0.32, Math.PI, 0);
  g.lineTo(0.32, -0.62);
  g.closePath();
  g.fillStyle = css(SOOT);
  g.fill();
  const fire = 0.8 + 0.2 * Math.sin(e.t * 7.3) * Math.sin(e.t * 3.1);
  const f = g.createRadialGradient(0, -0.66, 0, 0, -0.66, 0.3);
  f.addColorStop(0, css(FLAME, 0.95 * fire));
  f.addColorStop(0.35, css(FIRE, 0.7 * fire));
  f.addColorStop(1, css(FIRE, 0));
  g.fillStyle = f;
  g.fillRect(-0.32, -0.96, 0.64, 0.34);
  e.light(0, -0.7, 0.35, '#ff9a4a', 0.8 * fire, 'fire');
  e.at(0, -0.8, 'mouth');
  // the niche below (підпічок)
  rect(g, -0.28, -0.42, 0.28, -0.1, lerp(SOOT, DARK, 0.4));
}
function stoveSide(g) {
  rect(g, -1.05, -1.95, 1.05, 0, LIME);
  rect(g, -1.05, -0.1, 1.05, 0, lerp(LIME, CLAY, 0.5));
}
function flue(g, e) {
  const w = e.id === 'flue' ? 0.45 : 0.5;
  rect(g, -w, -0.55, w, 0, LIME);
}
// whitewash all over: the ceiling, the stove's top, the openings' sides
function lime(g) {
  rect(g, -10, -10, 10, 10, LIME);
}
// the сволок: a dark oak beam the length of the room (its underside, its sides)
function oak(g) {
  rect(g, -10, -10, 10, 10, DARK);
}

// ── the bench, the table ────────────────────────────────────────────────
// a bench's board seen from the room: the seat's edge, its legs into the shadow under it
const BENCHES = { bench: 5.1, bench_back: 2.6 };
function bench(g, e) {
  const L = BENCHES[e.id];
  rect(g, -L / 2, -0.45, L / 2, -0.38, WOOD);
  for (const x of e.id === 'bench' ? [-2.3, -0.8, 0.8, 2.3] : [-1.1, 1.1]) rect(g, x - 0.04, -0.38, x + 0.04, 0, DARK);
  if (e.id === 'bench') e.at(0, -0.45, 'seat');
}
function seat(g) {
  rect(g, -10, -10, 10, 10, WOOD);
}
// the tablecloth over the table: its top (a plane), white with an embroidered border — a row of
// small red and black marks, nothing more
function cloth(g) {
  const w = 1.25 / 2;
  const d = 1.25 / 2;
  rect(g, -w, -d, w, d, LINEN);
  for (let x = -w + 0.06; x < w - 0.04; x += 0.075) {
    const c = Math.round((x + w) / 0.075) % 3 === 2 ? INK : RED;
    for (const y of [-d + 0.05, d - 0.08]) rect(g, x, y, x + 0.035, y + 0.03, c);
  }
  for (let y = -d + 0.06; y < d - 0.04; y += 0.075) {
    const c = Math.round((y + d) / 0.075) % 3 === 2 ? INK : RED;
    for (const x of [-w + 0.05, w - 0.08]) rect(g, x, y, x + 0.03, y + 0.035, c);
  }
}
// a side of the table: the cloth falling over its edge, the legs below
function table(g, e) {
  const w = 1.25 / 2;
  rect(g, -w - 0.02, -0.78, w + 0.02, -0.5, LINEN);
  for (let x = -w + 0.06; x < w - 0.04; x += 0.075) {
    const c = Math.round((x + w) / 0.075) % 3 === 2 ? INK : RED;
    rect(g, x, -0.57, x + 0.035, -0.54, c);
  }
  for (const x of [-w + 0.05, w - 0.12]) rect(g, x, -0.5, x + 0.07, 0, DARK);
  if (e.id === 'table') e.at(0, -0.78, 'top');
}

// ── on the table ────────────────────────────────────────────────────────
// the lamp: a brass foot, an oil bowl, a glass chimney, the flame (lamp 1: lit; out in the morning)
function lamp(g, e) {
  const s = e.state;
  const on = clamp(s.lamp ?? 1) * (1 - clamp(s.morning ?? 0));
  rect(g, -0.07, -0.025, 0.07, 0, BRASS);
  rect(g, -0.018, -0.13, 0.018, -0.025, BRASS);
  g.beginPath();
  g.ellipse(0, -0.17, 0.065, 0.045, 0, 0, Math.PI * 2);
  g.fillStyle = css(lerp(BRASS, DARK, 0.2));
  g.fill();
  g.beginPath();
  g.moveTo(-0.03, -0.21);
  g.quadraticCurveTo(-0.055, -0.27, -0.03, -0.36);
  g.lineTo(0.03, -0.36);
  g.quadraticCurveTo(0.055, -0.27, 0.03, -0.21);
  g.closePath();
  g.fillStyle = css(lerp(LINEN, FLAME, 0.3 * on), 0.35 + 0.3 * on);
  g.fill();
  if (on > 0.01) {
    const k = 0.9 + 0.1 * Math.sin(e.t * 11) * Math.sin(e.t * 4.7);
    g.beginPath();
    g.ellipse(0, -0.255, 0.011, 0.03 * k, 0, 0, Math.PI * 2);
    g.fillStyle = css(FLAME, on);
    g.fill();
  }
  e.light(0, -0.255, 0.09, '#ffc27a', on, 'flame');
  e.at(0, -0.255, 'flame');
}
// the little mirror in its frame on a stand (the glass is `mirror`, its back `mirror_frame`)
function mirrorFrame(g) {
  g.fillStyle = css(DARK);
  g.beginPath();
  g.ellipse(0, -0.2, 0.105, 0.14, 0, 0, Math.PI * 2);
  g.fill();
  rect(g, -0.02, -0.07, 0.02, 0, DARK);
  rect(g, -0.06, -0.015, 0.06, 0, DARK);
}
function mirror(g, e) {
  g.fillStyle = css(INK);
  g.beginPath();
  g.ellipse(0, -0.2, 0.085, 0.12, 0, 0, Math.PI * 2);
  g.fill();
  e.at(0, -0.2, 'glass');
}

// ── the window ──────────────────────────────────────────────────────────
// in the middle of the wall's depth: the glass, just where the pane is (the engine shows through it
// and mirrors the room in it); the frame and its cross over it; the frost on it, a thawed peephole
// where `peep` says
function glass(g) {
  rect(g, WINDOW.x0, WINDOW.y0, WINDOW.x1, WINDOW.y1, SNOW);
}
function frame(g, e) {
  const { x0, y0, x1, y1 } = WINDOW;
  const b = 0.045;
  g.beginPath();
  g.rect(x0, y0, x1 - x0, y1 - y0);
  g.rect(x0 + b, y0 + b, (x1 - x0) / 2 - 1.5 * b, (y1 - y0) / 2 - 1.5 * b);
  g.rect((x0 + x1) / 2 + b / 2, y0 + b, (x1 - x0) / 2 - 1.5 * b, (y1 - y0) / 2 - 1.5 * b);
  g.rect(x0 + b, (y0 + y1) / 2 + b / 2, (x1 - x0) / 2 - 1.5 * b, (y1 - y0) / 2 - 1.5 * b);
  g.rect((x0 + x1) / 2 + b / 2, (y0 + y1) / 2 + b / 2, (x1 - x0) / 2 - 1.5 * b, (y1 - y0) / 2 - 1.5 * b);
  g.fillStyle = css(WOOD);
  g.fill('evenodd');
  e.at(0, (y0 + y1) / 2, 'glass');
}
function frost(g, e) {
  const s = e.state;
  const k = clamp(s.frost ?? 0);
  const { x0, y0, x1, y1 } = WINDOW;
  const w = x1 - x0;
  const h = y1 - y0;
  const peep = clamp(s.peep ?? 0);
  const px = x0 + w * clamp(s.peep_x ?? 0.5);
  const py = y0 + h * clamp(s.peep_y ?? 0.5);
  const pr = 0.03 + 0.13 * peep;
  e.at(px, py, 'peep');
  if (k < 0.01) return;
  g.save();
  g.beginPath();
  g.rect(x0, y0, w, h);
  g.clip();
  // the frost grows in from the edges: thick at the frame, a milky veil toward the middle
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(w, h) / 2);
  gr.addColorStop(0, css(FROST, 0.85 * k * k));
  gr.addColorStop(1 - 0.6 * k, css(FROST, Math.min(0.95, 1.2 * k)));
  gr.addColorStop(1, css(FROST, Math.min(1, 1.6 * k)));
  g.fillStyle = gr;
  g.fillRect(x0, y0, w, h);
  // ferns: needles growing in from the edges, each with side branches — whiter than the veil
  g.strokeStyle = css(FROST, 0.9 * k);
  g.lineCap = 'round';
  for (let i = 0; i < 64; i++) {
    const side = i % 4;
    const u = hash(i, 5);
    const len = (0.07 + 0.2 * hash(i, 6)) * (0.4 + 0.6 * k);
    const a = (hash(i, 7) - 0.5) * 1.1 + [Math.PI / 2, -Math.PI / 2, 0, Math.PI][side];
    const sx = side < 2 ? x0 + w * u : side === 2 ? x0 : x1;
    const sy = side === 0 ? y0 : side === 1 ? y1 : y0 + h * u;
    const ex = sx + len * Math.cos(a);
    const ey = sy + len * Math.sin(a);
    g.lineWidth = 0.006;
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(ex, ey);
    g.stroke();
    g.lineWidth = 0.003;
    g.beginPath();
    for (let f = 0.2; f < 0.95; f += 0.12) {
      const bx = sx + (ex - sx) * f;
      const by = sy + (ey - sy) * f;
      const bl = len * 0.35 * (1 - f);
      for (const turn of [-0.8, 0.8]) {
        g.moveTo(bx, by);
        g.lineTo(bx + bl * Math.cos(a + turn), by + bl * Math.sin(a + turn));
      }
    }
    g.stroke();
  }
  // the peephole: thawed by a breath, a finger — clear in the middle, frost back at its rim
  if (peep > 0.01) {
    g.globalCompositeOperation = 'destination-out';
    const hole = g.createRadialGradient(px, py, 0, px, py, pr);
    hole.addColorStop(0, 'rgba(0,0,0,1)');
    hole.addColorStop(0.7, 'rgba(0,0,0,0.9)');
    hole.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = hole;
    g.fillRect(px - pr, py - pr, 2 * pr, 2 * pr);
    // its rim, where the thaw stopped: a thin ring of wet ice
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = css(ICE_LINE, 0.5 * k * peep);
    g.lineWidth = 0.006;
    g.beginPath();
    g.arc(px, py, pr * 0.8, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

// ── the door ────────────────────────────────────────────────────────────
// planks, painted from its hinge (x 0 → its width); it turns open as `door_turn` says
const DOOR = { w: 0.95, h: 1.85 };
function door(g, e) {
  rect(g, 0, -DOOR.h, DOOR.w, 0, WOOD);
  for (let x = 0.19; x < DOOR.w - 0.05; x += 0.19) rect(g, x - 0.006, -DOOR.h, x + 0.006, 0, DARK, 0.6);
  for (const y of [-1.55, -0.3]) rect(g, 0.04, y - 0.06, DOOR.w - 0.04, y + 0.06, lerp(WOOD, DARK, 0.4));
  rect(g, DOOR.w - 0.16, -0.98, DOOR.w - 0.1, -0.86, DARK);
  e.at(DOOR.w - 0.13, -0.92, 'handle');
}
// the threshold: a raised board across the doorway
function threshold(g, e) {
  rect(g, -0.55, -0.1, 0.55, 0, lerp(WOOD, DARK, 0.25));
  e.at(0, -0.1, 'step');
}

// snow blown in over the threshold while the door stands open in the blizzard: a fan on the floor
function drift(g, e) {
  const s = e.state;
  const k = clamp(s.blizzard ?? 0) * clamp(s.door ?? 0);
  if (k < 0.01) return;
  const gr = g.createRadialGradient(0, -0.55, 0, 0, -0.55, 0.95);
  gr.addColorStop(0, css(SNOW, 0.9 * k));
  gr.addColorStop(0.5, css(SNOW, 0.45 * k));
  gr.addColorStop(1, css(SNOW, 0));
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(-0.47, -0.55);
  g.lineTo(0.47, -0.55);
  g.lineTo(0.75, 0.4);
  g.lineTo(-0.7, 0.45);
  g.closePath();
  g.fill();
}

// ── outside ─────────────────────────────────────────────────────────────
// the sky all round (the room's openings show it): night, or the morning, murky in the blizzard; the
// moon is out of sight
// (its light — `lights`), without it the stars are dimmer still
function sky(g, e) {
  const s = e.state;
  const m = clamp(s.morning ?? 0);
  const storm = 0.8 * clamp(s.blizzard ?? 0);
  const top = lerp(lerp(SKY_NIGHT[0], SKY_MORNING[0], m), SKY_STORM, storm);
  const low = lerp(lerp(SKY_NIGHT[1], SKY_MORNING[1], m), SKY_STORM, storm);
  const gr = g.createLinearGradient(0, -0.35, 0, 0.6);
  gr.addColorStop(0, css(top));
  gr.addColorStop(1, css(low));
  g.fillStyle = gr;
  g.fillRect(-0.3, -0.35, e.aspect + 0.6, 1.6);
  const stars = (1 - m) * (1 - clamp(s.blizzard ?? 0)) * (0.5 + 0.5 * clamp(s.moon ?? 1));
  if (stars < 0.02) return;
  g.fillStyle = css([0.9, 0.93, 1], 0.8 * stars);
  for (let i = 0; i < Math.round(60 * e.aspect); i++) {
    const x = e.aspect * hash(i, 1);
    const y = -0.35 + 0.8 * hash(i, 2) ** 1.4;
    g.beginPath();
    g.arc(x, y, 0.0012 + 0.0016 * hash(i, 3), 0, Math.PI * 2);
    g.fill();
  }
}
function snow(g) {
  rect(g, -1e3, -1e3, 1e3, 1e3, SNOW);
}
// a neighbour's хата out there: a white box under a snow roof, a warm window at night
function hut(g, e) {
  const s = e.state;
  const lit = 1 - clamp(s.morning ?? 0);
  rect(g, -4, -2.6, 4, 0, lerp(LIME, SNOW, 0.2));
  g.beginPath();
  g.moveTo(-4.6, -2.6);
  g.lineTo(-2.2, -5.4);
  g.lineTo(2.2, -5.4);
  g.lineTo(4.6, -2.6);
  g.closePath();
  g.fillStyle = css(SNOW);
  g.fill();
  for (const x of [-2, 1.2]) {
    rect(g, x, -1.85, x + 0.8, -1.05, lerp(hex('#5f7398'), FLAME, lit));
    if (lit > 0.01) e.light(x + 0.4, -1.45, 0.3, '#ffb35c', 0.6 * lit);
  }
}
// the street past the yard: packed snow, runners' tracks along it
function road(g) {
  rect(g, -60, -1.6, 60, 1.6, hex('#d6deec'));
  for (const y of [-0.6, -0.2, 0.5, 0.9]) rect(g, -60, y - 0.03, 60, y + 0.03, hex('#b9c4da'));
}
// a wattle fence across the street
function fence(g) {
  rect(g, -10, -1.2, 10, -0.5, hex('#6a5a4c'));
  for (let x = -10; x <= 10; x += 0.5) rect(g, x - 0.04, -1.45, x + 0.04, 0, DARK);
  rect(g, -10, -1.26, 10, -1.2, SNOW);
}
// the blizzard out there (and, with the door open, blowing in over the threshold)
function blizzard(g, e) {
  const s = e.state;
  let storm = clamp(s.blizzard ?? 0);
  if (e.id === 'blizzard_in') storm *= clamp(s.door ?? 0);
  if (storm < 0.01) return;
  const [w, top, n0, speed0] = e.id === 'blizzard_in' ? [0.6, 1.8, 45, 2] : [4, 3.2, 600, 7];
  const t = e.t;
  const gust = 1 + 0.35 * anim.drift(t * 0.3, 7);
  const n = Math.round(n0 * storm);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = hash(i, 31);
    const v = (speed0 + speed0 * z) * gust;
    const x = ((((hash(i, 32) * 2 * w - v * t) % (2 * w)) + 2 * w) % (2 * w)) - w;
    const y = ((((hash(i, 33) * top + (1 + z) * t) % top) + top) % top) - top;
    const len = 0.02 + 0.08 * z * gust;
    g.strokeStyle = css(SNOW, (0.25 + 0.5 * z) * storm);
    g.lineWidth = 0.006 + 0.012 * z;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y - len * 0.3);
    g.stroke();
  }
}

return {
  wall, floor, lime, oak, stove, stoveSide, flue, bench, seat, cloth, table,
  lamp, mirrorFrame, mirror, glass, frame, frost, door, threshold, drift, sky, snow, road, hut, fence, blizzard,
};
