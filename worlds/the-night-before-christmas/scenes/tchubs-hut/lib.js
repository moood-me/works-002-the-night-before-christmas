// Tchub's Hut — the room, painted in its daylight colours; the scene's light (lamp, stove, the window,
// the open door, light.looks) makes the evening, the night, the morning. The room is cards and
// planes: walls, the stove's faces, the bench's and the table's boards stand turned their own way
// (`facing`), tops, the floor and the ceiling are planes. Each is painted in its own metres: a card
// from its anchor (x along it as seen facing it, y down), a plane from above from its centre. What
// the world's huts share — their stuff, walls, stove, lamp, door, window, the yard — is the module
// `hut`; what is this room's — its sizes, the cloth, the mirror, the frost — is here.
const { clamp, hash } = anim;
const K = kit.hut;
const { hex, lerp, css, rect, LIME, CLAY, WOOD, LINEN, RED, INK } = K;

const SILVER = hex('#aeb6c2');
const FROST = hex('#eef3fa');
const ICE_LINE = hex('#9fb2cc');
const FERN = hex('#c6d3e6');

// ── the room ────────────────────────────────────────────────────────────
// Walls: [width, height, holes [x0, y0, x1, y1] in the wall's own metres, seen from inside]. The
// back wall has the door and, over the table, the window.
const WALLS = {
  wall_back: [6.4, 2.5, [[-1.15, -1.85, -0.2, 0], [1.25, -2, 2.45, -0.85]]],
  wall_left: [5.4, 2.5, []],
  wall_right: [5.4, 2.5, []],
  wall_front: [6.4, 2.5, []],
};
// the window's opening, from its middle — its glass, frame and frost paint over it
const WINDOW = { x0: -0.6, y0: -2, x1: 0.6, y1: -0.85 };
// the openings go through the wall (0.35 m, scene.json): their sides (the reveals) are whitewashed too
const DOOR = { w: 0.95, h: 1.85 };

// the clay floor; a woven runner from the door toward the front
function floor(g) {
  rect(g, -10, -10, 10, 10, CLAY);
  const x0 = -0.95;
  const x1 = -0.25;
  rect(g, x0, -2.6, x1, 2.4, lerp(LINEN, CLAY, 0.35));
  for (let y = -2.45; y < 2.3; y += 0.42) rect(g, x0, y, x1, y + 0.05, RED, 0.55);
}
// The stove: white, along the left wall — its long side turned to the room with the mouth
// nearer the back, where it is seen; its end toward us; its top (the stove-bed, a plane); the flue at
// the back up to the ceiling.
const STOVE = { w: 1.05, h: 1.95, mouth: 0.4, end: 0.8 };
function flue(g, e) {
  const w = e.id === 'flue' ? 0.4 : 0.35;
  rect(g, -w, -0.55, w, 0, LIME);
}

// ── the bench, the table ────────────────────────────────────────────────
// the tablecloth over the table: its top (a plane), white with an embroidered border — a row of
// small red and black marks, nothing more
const TABLE = { w: 1.4, d: 1.2, h: 0.78 };
function cloth(g) {
  const w = TABLE.w / 2;
  const d = TABLE.d / 2;
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
  K.table(g, (e.id === 'table' ? TABLE.w : TABLE.d) / 2, TABLE.h, true);
  if (e.id === 'table') e.at(0, -TABLE.h, 'top');
}

// ── on the table ────────────────────────────────────────────────────────
// the little mirror on a stand: a brass ring round silvered glass (the glass itself, what it mirrors,
// is `mirror`; this is its frame and its silvering) — not here while Oksana has it in her hand (the
// cast's `mirror`: oksana_with)
const inHand = e => [].concat(e.state.oksana_with ?? []).includes('mirror');
function mirrorFrame(g, e) {
  if (inHand(e)) return;
  rect(g, -0.015, -0.08, 0.015, 0, K.BRASS);
  rect(g, -0.07, -0.015, 0.07, 0, K.BRASS);
  g.beginPath();
  g.ellipse(0, -0.2, 0.105, 0.14, 0, 0, Math.PI * 2);
  g.fillStyle = css(K.BRASS);
  g.fill();
  g.beginPath();
  g.ellipse(0, -0.2, 0.085, 0.12, 0, 0, Math.PI * 2);
  g.fillStyle = css(SILVER);
  g.fill();
}
function mirror(g, e) {
  if (inHand(e)) return;
  g.fillStyle = css(INK);
  g.beginPath();
  g.ellipse(0, -0.2, 0.085, 0.12, 0, 0, Math.PI * 2);
  g.fill();
  e.at(0, -0.2, 'glass');
}

// ── out in the yard ─────────────────────────────────────────────────────
// Tchub's enormous lambskin hat, knocked off him into the drift by the door (chub_hat): lying tipped on its side in the
// snow, its blue cloth top toward us
function chubHat(g, e) {
  if (!e.state.chub_hat) return;
  g.save();
  g.rotate(-0.35);
  g.fillStyle = css(hex('#2a2524'));
  g.beginPath();
  g.ellipse(0, -0.17, 0.2, 0.15, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = css(hex('#2f5f8a'));
  g.beginPath();
  g.ellipse(0.17, -0.2, 0.05, 0.12, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.fillStyle = css(hex('#eef3fa'), 0.9);
  g.beginPath();
  g.ellipse(0, 0, 0.3, 0.05, 0, 0, Math.PI * 2);
  g.fill();
}

// ── on the floor ────────────────────────────────────────────────────────
// the carollers' sack, dragged in over the floor (sack: 1 — full, someone in it; 2 — untied, empty, crumpled): a
// lumpy bag of coarse cloth, its gathered neck on top; its neck `sack#neck` — where hands take it
const SACKING = hex('#8a7a5c');
function sack(g, e) {
  const k = e.state.sack ?? 0;
  if (k < 0.5) return;
  const full = k < 1.5;
  const h = full ? 0.42 : 0.12;
  g.fillStyle = css(SACKING);
  g.beginPath();
  g.moveTo(-0.45, 0);
  g.bezierCurveTo(-0.5, -h * 0.8, -0.25, -h, 0, -h * 0.95);
  g.bezierCurveTo(0.25, -h * 0.9, 0.42, -h * 0.6, 0.38, 0);
  g.closePath();
  g.fill();
  g.fillStyle = css(lerp(SACKING, INK, 0.25));
  g.beginPath();
  g.ellipse(0, -h * 0.98, 0.07, 0.04, 0, 0, Math.PI * 2);
  g.fill();
  e.at(0, -h, 'neck');
}
// what Vakula leaves on the threshold (gift_left), as he brought it (gift: 1 — the slippers, 2 — the box of paints
// and the letter)
function giftStep(g, e) {
  if (!e.state.gift_left) return;
  if ((e.state.gift ?? 1) > 1.5) {
    rect(g, -0.17, -0.12, 0.17, 0, hex('#7a4a2a'));
    rect(g, -0.14, -0.13, 0.14, -0.12, hex('#c9a24a'));
    rect(g, -0.13, -0.18, 0.13, -0.13, hex('#ece2c8'));
    return;
  }
  for (const x of [-0.07, 0.07]) {
    g.fillStyle = css(hex('#c42a2a'));
    g.beginPath();
    g.ellipse(x, -0.04, 0.045, 0.04, 0, 0, Math.PI * 2);
    g.fill();
    rect(g, x - 0.04, -0.11, x + 0.03, -0.04, hex('#c42a2a'));
    rect(g, x - 0.04, -0.12, x + 0.03, -0.105, hex('#d9a93a'));
  }
}

// ── the window's frost ──────────────────────────────────────────────────
// the peephole as the state says: its middle and radius, in the frost's metres (its point `frost#peep`
// is marked by beforeFrame — this frame's, the frost painted or not)
function peepOf(s) {
  const { x0, y0, x1, y1 } = WINDOW;
  return [x0 + (x1 - x0) * clamp(s.peep_x ?? 0.5), y0 + (y1 - y0) * clamp(s.peep_y ?? 0.5), 0.03 + 0.19 * clamp(s.peep ?? 0)];
}
function frost(g, e) {
  const s = e.state;
  const k = clamp(s.frost ?? 0);
  const { x0, y0, x1, y1 } = WINDOW;
  const w = x1 - x0;
  const h = y1 - y0;
  const peep = clamp(s.peep ?? 0);
  const [px, py, pr] = peepOf(s);
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
  // ferns: needles growing in from the edges, each with side branches — their crystals catch the
  // light a little greyer than the veil
  g.strokeStyle = css(FERN, 0.9 * k);
  g.lineCap = 'round';
  for (let i = 0; i < 96; i++) {
    const side = i % 4;
    const u = hash(i, 5);
    const len = (0.1 + 0.3 * hash(i, 6)) * (0.4 + 0.6 * k);
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
    g.strokeStyle = css(ICE_LINE, 0.8 * k * peep);
    g.lineWidth = 0.012;
    g.beginPath();
    g.arc(px, py, pr * 0.8, 0, Math.PI * 2);
    g.stroke();
  }
  g.restore();
}

// the blizzard out there and, with the door open, blowing in over the threshold
const STORM = { blizzard: [4, 3.2, 600, 7], blizzard_in: [0.6, 1.8, 45, 2] };
function blizzard(g, e) {
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0) * (e.id === 'blizzard_in' ? clamp(s.door ?? 0) : 1);
  K.blizzard(g, e, STORM[e.id], storm);
}

// ── from frame to frame ─────────────────────────────────────────────────
// the peephole's point, this frame's (the frost painted or not)
function beforeFrame({ state, at }) {
  const [px, py] = peepOf(state);
  at('frost', px, py, 'peep');
}

return {
  beforeFrame,
  wall: (g, e) => K.wall(g, ...WALLS[e.id]),
  floor,
  lime: (g) => K.fill(g, LIME),
  oak: (g) => K.fill(g, K.DARK),
  stove: (g, e) => K.stove(g, e, -STOVE.w, STOVE.w, STOVE.h, STOVE.mouth),
  stoveEnd: (g, e) => K.stove(g, e, -STOVE.end, STOVE.end, STOVE.h),
  flue,
  bench: (g, e) => K.bench(g, e, 4),
  seat: (g) => K.fill(g, WOOD),
  cloth,
  table,
  lamp: K.lamp,
  mirrorFrame,
  mirror,
  glass: (g) => K.pane(g, WINDOW),
  frame: (g, e) => K.frame(g, e, WINDOW),
  frost,
  door: (g, e) => K.door(g, e, DOOR.w, DOOR.h),
  threshold: (g, e) => K.threshold(g, e, 1.1),
  drift: K.drift,
  sky: K.sky,
  snow: K.snow,
  road: K.road,
  hut: K.hut,
  fence: K.fence,
  blizzard,
  chubHat,
  sack,
  giftStep,
};
