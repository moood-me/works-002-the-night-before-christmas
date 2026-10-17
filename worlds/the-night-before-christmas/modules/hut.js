// The huts from inside — what the rooms of the world (Tchub's, Soloha's) share: their materials, painted in
// daylight colours (each scene's light makes the evening, the night, the morning); a whitewashed wall
// with its openings cut out; the stove's faces, the fire in its mouth; a bench, a table's side; the
// lamp; a window's pane and frame; the door, its threshold; and the yard beyond: the sky, the snow, the
// street, a neighbour's hut, a fence, the blizzard and the snow it blows in. Each painter paints in
// its element's own metres (a card from its anchor, x along it as seen facing it, y down; a plane from
// above, from its centre), at the sizes the scene gives it — what a room is, its sizes, is the scene's.
const { clamp, mix, hash } = anim;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
function rect(g, x0, y0, x1, y1, c, alpha = 1) {
  g.fillStyle = css(c, alpha);
  g.fillRect(x0, y0, x1 - x0, y1 - y0);
}
// a surface all of one stuff (the ceiling, a beam, a board, the snow)
const fill = (g, c, r = 10) => rect(g, -r, -r, r, r, c);

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
const SKY_NIGHT = [hex('#0b1330'), hex('#24376c')];
const SKY_MORNING = [hex('#7f9fd2'), hex('#dfe8f4')];
const SKY_STORM = hex('#161b2c');

// ── walls ───────────────────────────────────────────────────────────────
// a whitewashed wall w × h — its whitewash `lime`, white unless tinted — with its openings ([x0, y0,
// x1, y1], as seen from inside) cut out, a clay band along the floor
function wall(g, w, h, holes, lime = LIME) {
  g.beginPath();
  g.rect(-w / 2, -h, w, h);
  for (const [x0, y0, x1, y1] of holes) g.rect(x0, y0, x1 - x0, y1 - y0);
  g.fillStyle = css(lime);
  g.fill('evenodd');
  g.save();
  g.clip('evenodd');
  rect(g, -w / 2, -0.12, w / 2, 0, lerp(lime, CLAY, 0.55));
  g.restore();
}

// ── the stove ───────────────────────────────────────────────────────────
// A face of the stove from x0 to x1, h high, whitewashed over a clay plinth; with x (the mouth's
// middle) the face with the mouth: the ledge under it, the fire in it — `fire` how
// much is left of it (1 burning, 0 cold) — and the niche below; the fire is a light of the
// element ('id#fire'), the mouth a point ('id#mouth').
const PLINTH = lerp(LIME, CLAY, 0.5);
const MOUTH = { r: 0.32, sill: -0.62 };
// the mouth's outline, its middle at x: an arch over the ledge (a path, to fill)
function mouth(g, x) {
  const { r, sill } = MOUTH;
  g.beginPath();
  g.moveTo(x - r, sill);
  g.lineTo(x - r, sill - 0.4);
  g.arc(x, sill - 0.4, r, Math.PI, 0);
  g.lineTo(x + r, sill);
  g.closePath();
}
function stove(g, e, x0, x1, h, x = null, fire = 1) {
  rect(g, x0, -h, x1, 0, LIME);
  rect(g, x0, -0.1, x1, 0, PLINTH);
  if (x === null) return;
  const { r, sill } = MOUTH;
  rect(g, x0, sill, x1, sill + 0.06, lerp(LIME, DARK, 0.18));
  mouth(g, x);
  g.fillStyle = css(SOOT);
  g.fill();
  const k = fire * (0.8 + 0.2 * Math.sin(e.t * 7.3) * Math.sin(e.t * 3.1));
  if (k > 0.005) {
    const f = g.createRadialGradient(x, sill - 0.04, 0, x, sill - 0.04, 0.3);
    f.addColorStop(0, css(FLAME, 0.95 * k));
    f.addColorStop(0.35, css(FIRE, 0.7 * k));
    f.addColorStop(1, css(FIRE, 0));
    g.fillStyle = f;
    g.fillRect(x - r, sill - 0.34, 2 * r, 0.34);
  }
  e.light(x, sill - 0.08, 0.35, '#ff9a4a', 0.8 * k, 'fire');
  e.at(x, sill - 0.18, 'mouth');
  rect(g, x - 0.28, -0.42, x + 0.28, -0.1, lerp(SOOT, DARK, 0.4));
}

// ── bench, table ────────────────────────────────────────────────────────
// a bench L long seen from the room: its board's edge, legs into the shadow under it ('id#seat')
function bench(g, e, L) {
  rect(g, -L / 2, -0.45, L / 2, -0.38, WOOD);
  for (const x of [-(L / 2 - 0.2), 0, L / 2 - 0.2]) rect(g, x - 0.04, -0.38, x + 0.04, 0, DARK);
  e.at(0, -0.45, 'seat');
}
// a side of a table 2w long, its top h high: a cloth over it falls over the edge — its border a row of
// red and black marks — or (cloth false) the edge of the board; the frame under it, the legs
function table(g, w, h, cloth) {
  if (cloth) {
    rect(g, -w - 0.02, -h, w + 0.02, -h + 0.14, LINEN);
    for (let x = -w + 0.06; x < w - 0.04; x += 0.075) {
      const c = Math.round((x + w) / 0.075) % 3 === 2 ? INK : RED;
      rect(g, x, -h + 0.09, x + 0.035, -h + 0.115, c);
    }
  } else rect(g, -w - 0.03, -h, w + 0.03, -h + 0.05, WOOD);
  rect(g, -w + 0.04, -h + 0.14, w - 0.04, -h + 0.2, WOOD);
  for (const x of [-w + 0.05, w - 0.11]) rect(g, x, -h + 0.2, x + 0.06, 0, WOOD);
}

// ── the lamp ────────────────────────────────────────────────────────────
// a brass foot, an oil bowl, a glass chimney, the flame (lamp 1: lit; out in the morning) — its light
// 'id#flame', its point too
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

// ── a window ────────────────────────────────────────────────────────────
// W: its opening { x0, y0, x1, y1 } in the wall's metres. The pane — just where the glass is (the
// engine shows through it and mirrors the room in it); the frame with its cross over it ('id#glass')
function pane(g, W) {
  rect(g, W.x0, W.y0, W.x1, W.y1, SNOW);
}
function frame(g, e, W) {
  const { x0, y0, x1, y1 } = W;
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

// ── the door ────────────────────────────────────────────────────────────
// planks w × h, painted from its hinge (x 0 → w; the engine turns it open about it), two battens
// across, the handle ('id#handle')
function door(g, e, w, h) {
  rect(g, 0, -h, w, 0, WOOD);
  for (let x = 0.19; x < w - 0.05; x += 0.19) rect(g, x - 0.006, -h, x + 0.006, 0, DARK, 0.6);
  for (const y of [-h + 0.3, -0.3]) rect(g, 0.04, y - 0.06, w - 0.04, y + 0.06, lerp(WOOD, DARK, 0.4));
  rect(g, w - 0.16, -0.98, w - 0.1, -0.86, DARK);
  e.at(w - 0.13, -0.92, 'handle');
}
// the threshold: a raised board across a doorway w wide ('id#step')
function threshold(g, e, w) {
  rect(g, -w / 2, -0.1, w / 2, 0, lerp(WOOD, DARK, 0.25));
  e.at(0, -0.1, 'step');
}
// snow blown in over the threshold while the door stands open in the blizzard: a fan on the floor
// (a plane, its near edge toward the room)
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

// ── the yard ────────────────────────────────────────────────────────────
// the sky all round (a room's openings show it): night, or the morning, murky in the blizzard; the
// moon is out of sight (its light is the scene's), without it the stars are dimmer still
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
// the snow of the yard (a plane), round the hut standing on it — its floor, [x0, y0, x1, y1], left out
function snow(g, e, hole) {
  g.beginPath();
  g.rect(-1e3, -1e3, 2e3, 2e3);
  if (hole) g.rect(hole[0], hole[1], hole[2] - hole[0], hole[3] - hole[1]);
  g.fillStyle = css(SNOW);
  g.fill('evenodd');
}
// a neighbour's hut out there: a white box under a snow roof, a warm window at night
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
// the street past the yard: packed snow, runners' tracks along it (a plane)
function road(g) {
  rect(g, -60, -1.6, 60, 1.6, hex('#d6deec'));
  for (const y of [-0.6, -0.2, 0.5, 0.9]) rect(g, -60, y - 0.03, 60, y + 0.03, hex('#b9c4da'));
}
// a wattle fence 20 m long
function fence(g) {
  rect(g, -10, -1.2, 10, -0.5, hex('#6a5a4c'));
  for (let x = -10; x <= 10; x += 0.5) rect(g, x - 0.04, -1.45, x + 0.04, 0, DARK);
  rect(g, -10, -1.26, 10, -1.2, SNOW);
}
// The blizzard as much as `storm` (0…1) says, over [w, top, n, speed]: half as wide as w, as high as
// top, n strokes of snow at its full, blown sideways at speed. The wind gusts: the snow goes as far as
// the gusts have added up — `blown`, kept by beforeFrame, the painting only reads it.
const gust = (t) => 1 + 0.35 * anim.drift(t * 0.3, 7);
let blown = 0;
function blizzard(g, e, [w, top, n0, speed0], storm) {
  if (storm < 0.01) return;
  const t = e.t;
  const now = gust(t);
  const n = Math.round(n0 * storm);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = hash(i, 31);
    const x = ((((hash(i, 32) * 2 * w - speed0 * (1 + z) * blown) % (2 * w)) + 2 * w) % (2 * w)) - w;
    const y = ((((hash(i, 33) * top + (1 + z) * t) % top) + top) % top) - top;
    const len = 0.02 + 0.08 * z * now;
    g.strokeStyle = css(SNOW, (0.25 + 0.5 * z) * storm);
    g.lineWidth = 0.006 + 0.012 * z;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y - len * 0.3);
    g.stroke();
  }
}

// ── from frame to frame ─────────────────────────────────────────────────
function beforeFrame({ t, dt }) {
  blown += gust(t) * dt;
}

return {
  hex, lerp, css, rect, fill,
  LIME, CLAY, WOOD, DARK, LINEN, RED, INK, SOOT, BRASS,
  wall, stove, mouth, bench, table, lamp, pane, frame, door, threshold, drift,
  sky, snow, hut, road, fence, blizzard, beforeFrame,
};
