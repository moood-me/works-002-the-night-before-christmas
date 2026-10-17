// Soloha's Hut — the widow's room, painted in its daylight colours; the scene's light (the lamp, the
// embers in the stove, the window, the open door, the moon rolling on the floor, light.looks) makes
// the night. Lower and warmer than Tchub's: rose-tinted whitewash, and in the middle of it the big white
// stove, its mouth toward us, its flue going up through the ceiling; three sacks of coal by it, a
// table with a bottle and bowls by the bench, the door in the right wall, a small window. What the
// world's huts share — their stuff, walls, stove, lamp, door, window, the yard — is the module
// `khata`; the room's sizes and what is only Soloha's — the sacks, the moon, the soot, the broom — are
// here.
const { clamp, mix, span, hash, noise, ease } = anim;
const K = kit.khata;
const { hex, lerp, css, rect, LIME, CLAY, WOOD, DARK, SOOT } = K;

const ROSE = hex('#e8d3c6'); // her whitewash, tinted
const SACKING = hex('#574c43');
const HEMP = hex('#a08a63'); // the cords
const SMOKED = hex('#54473d'); // the ceiling's boards, smoked
const COAL = hex('#2c2827');
const BIRCH = hex('#c9b28a'); // the broom's twigs
const RUBY = hex('#7a1424');
const GLAZE = hex('#3f5a4c'); // the bowls' glaze inside
const MOON = hex('#f4f2ea');
const MOON_HOT = hex('#fff6dc');
const MOONLIGHT = hex('#dfe8ff');

// ── the room ────────────────────────────────────────────────────────────
// 6 × 6 m, 2.3 m high, seen from its front-left corner. Walls: [width, height, holes [x0, y0, x1, y1]
// in the wall's own metres, seen from inside]: the small window in the back wall, left of the stove;
// the door in the right wall (along it x runs to the front: x = −z). The openings go through the wall
// (0.4 m): their sides whitewashed.
const H = 2.3;
const WALLS = {
  wall_back: [6, H, [[-1.6, -1.6, -1, -1.05]]],
  wall_left: [6, H, []],
  wall_right: [6, H, [[-1.2, -1.8, -0.3, 0]]],
  wall_front: [6, H, []],
};
// the window's opening from its middle (its pane, frame paint over it); the door
const WINDOW = { x0: -0.3, y0: -1.6, x1: 0.3, y1: -1.05 };
const DOOR = { w: 0.94, h: 1.82 }; // over its jambs and lintel by 2 cm

// The stove: 1.9 × 1.5 m, 1.6 high, in the middle toward the back; the mouth in its front, toward
// us; the flue (0.6 m square) from its top up through the ceiling. The embers left in it glow low.
const STOVE = { w: 1.9, d: 1.5, h: 1.6, flue: 0.6, embers: 0.45 };
// Where things are in the room — metres in the room's own axes (x right, z away from its front wall,
// its middle 0, 0: the room is turned in the scene as one, on `room`) — as the scene places them; the
// painting needs them to find one from another: the sacks, the stove's mouth, the flue, the moon
const AT = {
  mouth: [0.65, 0.45, 0.8],
  flue: [0.65, 1.55],
  sack1: [-0.55, 0],
  sack2: [-1, 0.5],
  sack3: [-0.7, 1.2],
  moon: [-0.3, -0.3], // where the moon falls out (the moon's element stands here)
};

// the clay floor, coal dust trodden round the sacks and spilt soot before the stove's mouth (a plane
// under the whole room, from above: y toward the front wall)
const onFloor = ([x, z]) => [x, -z];
function floor(g) {
  rect(g, -10, -10, 10, 10, CLAY);
  const smudge = (x, y, r, a) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, css(COAL, a));
    gr.addColorStop(1, css(COAL, 0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  for (const id of ['sack1', 'sack2', 'sack3']) smudge(...onFloor(AT[id]), 0.75, 0.35);
  const [mx, my] = onFloor(AT.mouth);
  g.save();
  g.translate(mx, my + 0.05);
  g.scale(1, 0.45);
  smudge(0, 0, 0.7, 0.4);
  g.restore();
}
// the ceiling: boards smoked dark, darker still round the flue (from above, as the floor)
function ceiling(g) {
  rect(g, -10, -10, 10, 10, SMOKED);
  for (let x = -3; x < 3; x += 0.3) rect(g, x - 0.006, -3, x + 0.006, 3, lerp(SMOKED, SOOT, 0.6));
  const [x, y] = onFloor(AT.flue);
  const gr = g.createRadialGradient(x, y, 0.3, x, y, 1.4);
  gr.addColorStop(0, css(SOOT, 0.6));
  gr.addColorStop(1, css(SOOT, 0));
  g.fillStyle = gr;
  g.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
}

// ── the stove ───────────────────────────────────────────────────────────
// Its front: the mouth with the embers, the soot licked up over it; when the moon is thrown in
// (moon_up), the mouth blazes white — its light 'stove#moon'. Its sides and back: whitewash.
// moon_up: 0…0.35 the moon flies from the floor into the mouth, 0.35…0.6 it is in the stove (the mouth
// blazing), going up the flue; the hut floods with its white light (the look `flood`, script.js) and
// it is gone.
const inStove = (s) => span(s.moon_up ?? 0, 0.3, 0.4) * (1 - span(s.moon_up ?? 0, 0.55, 0.8));
function stove(g, e) {
  const w = STOVE.w / 2;
  K.stove(g, e, -w, w, STOVE.h, 0, STOVE.embers);
  // the soot over the mouth, licked up the face
  const gr = g.createLinearGradient(0, -1.3, 0, -1.6);
  gr.addColorStop(0, css(SOOT, 0.5));
  gr.addColorStop(1, css(SOOT, 0));
  g.fillStyle = gr;
  g.beginPath();
  g.moveTo(-0.3, -1.1);
  g.quadraticCurveTo(-0.24, -1.45, -0.08, -1.6);
  g.lineTo(0.08, -1.6);
  g.quadraticCurveTo(0.24, -1.45, 0.3, -1.1);
  g.closePath();
  g.fill();
  const k = inStove(e.state);
  if (k > 0.002) {
    K.mouth(g, 0);
    g.fillStyle = css(MOON_HOT, k);
    g.fill();
    e.light(0, -0.8, 0.3, '#e8efff', 1.2 * k, 'moon');
  }
  e.at(0, -STOVE.h, 'top');
}
const stoveSide = (g, e) => K.stove(g, e, -STOVE.d / 2, STOVE.d / 2, STOVE.h);
const stoveBack = (g, e) => K.stove(g, e, -STOVE.w / 2, STOVE.w / 2, STOVE.h);
// the flue's faces, from the stove's top to the ceiling ('flue#top' — where the moon goes)
function flue(g, e) {
  const w = STOVE.flue / 2;
  rect(g, -w, STOVE.h - H, w, 0, LIME);
  if (e.id === 'flue') e.at(0, STOVE.h - H, 'top');
}

// ── the sacks ───────────────────────────────────────────────────────────
// Three sacks of coal by the stove, the hiding places. Who is in which: in1…in3 — names joined by '+'
// ('head', 'dyak+chub'), as they went in; `who` (1 the devil, 2 the mayor, 3 the sacristan, 4 Tchub) — who is
// going in now, `stuff` 0…1 how far: the sack he goes into stands open till he is in. A sack is as
// big as the coal and whoever is in it. `which` (1…3) of them wriggles (`wriggle` 0…1) and, as
// `sneeze` comes to 1, hops (when — kept by beforeFrame).
const WHO = [null, 'devil', 'head', 'dyak', 'chub'];
const BULK = { devil: 0.3, head: 0.8, dyak: 0.6, chub: 0.75 };
const COAL_BULK = 0.25;
function inside(e, n) {
  const s = e.state;
  const names = String(s[`in${n}`] ?? '').split('+').filter(Boolean);
  for (const name of names) {
    if (!(name in BULK)) e.warn(`in${n}: no one called "${name}" — the guests: ${Object.keys(BULK).join(', ')}`);
  }
  const going = WHO[s.who ?? 0] ?? null;
  const stuff = clamp(s.stuff ?? 1);
  const last = names[names.length - 1];
  const open = going !== null && last === going ? 1 - stuff : 0;
  let bulk = COAL_BULK;
  names.forEach((name, i) => {
    bulk += (BULK[name] ?? 0) * (i === names.length - 1 && open > 0 ? stuff : 1);
  });
  return { bulk, open };
}
let sneezedAt = -1e9;
const HOP = 0.5;
function sack(g, e) {
  const s = e.state;
  const n = Number(e.id.slice(4));
  // (on Vakula's shoulder: the cast's sack, not here)
  if (String(s.carried ?? '').split('+').includes(String(n))) return;
  const { bulk, open } = inside(e, n);
  const v = clamp(bulk / 1.6);
  const h = mix(0.55, 1.15, v);
  const w = mix(0.46, 0.8, v);
  const mine = (s.which ?? 1) === n;
  const wr = mine ? clamp(s.wriggle ?? 0) : 0;
  const t = e.t;
  const age = mine ? t - sneezedAt : 1e9;
  // the hop: up and down in HOP s, squashed as it lands
  const u = clamp(age / HOP);
  const hop = age < HOP ? 0.22 * Math.sin(Math.PI * u) : 0;
  const squash = age < HOP + 0.25 ? 0.12 * Math.sin(Math.PI * clamp((age - HOP * 0.8) / 0.4)) : 0;
  // whoever is in it shoves: the sides bulge in turn, the top nods
  const push = (seed) => wr * noise(t * 2.6 + seed * 9, n * 7 + seed);
  const hh = h * (1 - squash) + 0.04 * push(3);
  const ww = w * (1 + 0.6 * squash);
  g.save();
  g.translate(0.05 * push(4), -hop);
  // the outline: a heavy soft bottom, full sides, shoulders gathered to the neck — low-poly facets
  const P = (x, y) => [x * ww, y * hh];
  const b = 0.06 * push(1);
  const c = 0.05 * push(2);
  const pts = [
    P(-0.4, 0),
    P(-0.5, -0.06),
    P(-0.55 - b, -0.25),
    P(-0.52 - c, -0.48),
    P(-0.4, -0.68),
    P(-0.2, -0.84),
    P(-0.09, -0.9),
    P(0.09, -0.9),
    P(0.22, -0.82),
    P(0.43 + c, -0.64),
    P(0.54 + b, -0.42),
    P(0.55, -0.2),
    P(0.48, -0.05),
    P(0.38, 0),
  ];
  const poly = (list, col, a = 1) => {
    g.beginPath();
    list.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = css(col, a);
    g.fill();
  };
  poly(pts, SACKING);
  // facets: the upper left a shade lighter, the right darker, the coal heavy in the bottom
  poly([pts[3], pts[4], pts[5], pts[6], P(0, -0.6), P(-0.2, -0.35)], lerp(SACKING, LIME, 0.1));
  poly([pts[7], pts[8], pts[9], pts[10], P(0.2, -0.4), P(0.05, -0.65)], lerp(SACKING, COAL, 0.3));
  poly([pts[0], pts[1], pts[2], P(0, -0.18), pts[11], pts[12], pts[13]], lerp(SACKING, COAL, 0.5));
  if (open > 0.01) {
    // open: the neck spread, the dark inside showing
    const r = 0.17 * ww * (0.6 + 0.4 * open);
    g.beginPath();
    g.ellipse(0, -0.92 * hh, r * 1.4, r * 0.45, 0, 0, Math.PI * 2);
    g.fillStyle = css(SACKING);
    g.fill();
    g.beginPath();
    g.ellipse(0, -0.92 * hh, r * 1.15, r * 0.32, 0, 0, Math.PI * 2);
    g.fillStyle = css(COAL);
    g.fill();
  } else {
    // tied: a cord round the neck, the gathered end flopped over
    const knot = [P(-0.08, -0.9), P(-0.12, -0.97), P(-0.04, -1.02), P(0.07, -1.0), P(0.17, -0.95), P(0.1, -0.9)];
    poly(knot, lerp(SACKING, LIME, 0.05));
    rect(g, -0.1 * ww, -0.915 * hh, 0.1 * ww, -0.89 * hh, HEMP);
  }
  e.at(0, -0.95 * hh, 'neck');
  e.at(0, -0.95 * hh);
  g.restore();
  // a sneeze blows coal dust out of the neck: a puff of fine grains, spreading and settling
  if (age < 1.2) {
    const k = 1 - age / 1.2;
    for (let i = 0; i < 24; i++) {
      const a = -Math.PI / 2 + (hash(i, n) - 0.5) * 2.4;
      const r = (0.05 + 0.35 * hash(i, n + 9)) * ease.out(clamp(age / 0.6));
      const x = r * Math.cos(a);
      const y = -0.95 * hh - hop + r * Math.sin(a) + 0.15 * age * age;
      g.beginPath();
      g.arc(x, y, 0.008 + 0.012 * hash(i, n + 5), 0, Math.PI * 2);
      g.fillStyle = css(COAL, 0.7 * k);
      g.fill();
    }
  }
}

// ── the moon ────────────────────────────────────────────────────────────
// Out of the devil's pocket the moon rolls over the floor, glowing: moon_floor 0…1 — along its way,
// from the sacks out toward us (0: still in the pocket); a crescent, rolling on its back like a wheel.
// moon_held 1 — it is in a hand (whose hands paint it then), not on the floor. moon_up — thrown into
// the stove's mouth. Its light 'moon_in#glow'; its point 'moon_in#moon'.
const ROLL = [[0, 0], [0.5, -0.35], [1.2, -0.1]]; // its way, metres from where it falls out
const MOON_R = 0.16;
const way = (u) => {
  const [a, b, c] = ROLL;
  const q = (i) => (1 - u) * (1 - u) * a[i] + 2 * u * (1 - u) * b[i] + u * u * c[i];
  return [q(0), q(1)];
};
function moon(g, e) {
  const s = e.state;
  const f = clamp(s.moon_floor ?? 0);
  const up = clamp(s.moon_up ?? 0);
  if (f <= 0 || up >= 0.4 || (s.moon_held ?? 0) >= 0.5) return;
  // on the floor: rolled as far as f; thrown: from there up and into the mouth
  const [fx, fz] = way(f);
  const fly = ease.inOut(span(up, 0, 0.33));
  const [mx, mz] = [AT.mouth[0] - AT.moon[0], AT.mouth[1] - AT.moon[1]];
  const dx = mix(fx, mx, fly);
  const dz = mix(fz, mz, fly);
  const lift = mix(0, AT.mouth[2], fly) + 0.9 * Math.sin(Math.PI * fly);
  const size = 1 - span(up, 0.3, 0.4);
  // rolled: as far as it has gone, over its radius
  let len = 0;
  for (let i = 1; i <= 12; i++) {
    const [x0, z0] = way((f * (i - 1)) / 12);
    const [x1, z1] = way((f * i) / 12);
    len += Math.hypot(x1 - x0, z1 - z0);
  }
  const turn = len / MOON_R + 5 * fly;
  const breathe = 0.85 + 0.15 * Math.sin(e.t * 2.3) * Math.sin(e.t * 1.3);
  e.part(dx, dz, (pg) => {
    pg.translate(0, -MOON_R - lift);
    pg.scale(size, size);
    // its own glow round it, close
    const gr = pg.createRadialGradient(0, 0, 0, 0, 0, MOON_R * 2);
    gr.addColorStop(0.4, css(MOONLIGHT, 0));
    gr.addColorStop(0.5, css(MOONLIGHT, 0.35 * breathe));
    gr.addColorStop(1, css(MOONLIGHT, 0));
    pg.fillStyle = gr;
    pg.fillRect(-MOON_R * 2, -MOON_R * 2, MOON_R * 4, MOON_R * 4);
    pg.rotate(turn);
    pg.save();
    pg.beginPath();
    pg.arc(0, 0, MOON_R, 0, Math.PI * 2);
    pg.clip();
    pg.arc(0.5 * MOON_R, -0.25 * MOON_R, 0.8 * MOON_R, 0, Math.PI * 2, true);
    pg.fillStyle = css(lerp(MOON, MOON_HOT, 0.5));
    pg.fill('evenodd');
    pg.restore();
    e.light(-0.55 * MOON_R, 0.3 * MOON_R, 0.08, '#e4ecff', 1.2 * size, 'glow');
    e.at(0, 0, 'moon');
  }, [-0.8, -2.2, 0.8, 0.3]);
}

// ── soot ────────────────────────────────────────────────────────────────
// A cloud of soot out of the stove's mouth as someone comes down the flue: `soot` 0…1 — bursting out
// (to 0.3), rolling up and spreading, settling away (to 1). Soft dark puffs, each its own way.
function soot(g, e) {
  const u = clamp(e.state.soot ?? 0);
  if (u <= 0 || u >= 1) return;
  const t = e.t;
  const my = AT.mouth[2];
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI / 2 + (hash(i, 41) - 0.5) * 2.8;
    const start = 0.15 * hash(i, 42);
    const k = ease.out(span(u, start, start + 0.5));
    const reach = (0.25 + 0.85 * hash(i, 43)) * k;
    const x = reach * Math.cos(a) * 1.3 + 0.05 * noise(t * 0.7 + i, 44);
    const y = -my + reach * Math.sin(a) * 0.8 - 0.3 * k * hash(i, 45);
    const r = (0.12 + 0.2 * hash(i, 46)) * (0.5 + 0.9 * k);
    const fade = (1 - span(u, 0.3 + 0.35 * hash(i, 47), 1)) * span(u, start, start + 0.04);
    if (fade <= 0) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, css(SOOT, 0.9 * fade));
    gr.addColorStop(0.6, css(SOOT, 0.6 * fade));
    gr.addColorStop(1, css(SOOT, 0));
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  e.at(0, -my - 0.3, 'cloud');
}

// ── by the stove: the broom ─────────────────────────────────────────────
// a besom leaning on the stove (the scene leans it): a birch bundle, the handle up
function broom(g) {
  rect(g, -0.02, -1.45, 0.02, -0.38, WOOD);
  g.beginPath();
  g.moveTo(-0.05, -0.42);
  g.lineTo(-0.16, 0);
  g.lineTo(0.16, 0);
  g.lineTo(0.05, -0.42);
  g.closePath();
  g.fillStyle = css(BIRCH);
  g.fill();
  rect(g, -0.055, -0.4, 0.055, -0.36, DARK);
  g.strokeStyle = css(lerp(BIRCH, DARK, 0.35));
  g.lineWidth = 0.008;
  g.beginPath();
  for (let i = 0; i < 9; i++) {
    const x = -0.13 + (0.26 * i) / 8;
    g.moveTo(x * 0.35, -0.36);
    g.lineTo(x, 0);
  }
  g.stroke();
}

// ── the table, the bench, the stool ─────────────────────────────────────
// The table along the bench by the left wall: scrubbed boards, no cloth; on it the lamp, a bottle of
// cherry brandy, two bowls (`dishes`: each a part, at its own place on the top).
const TABLE = { w: 0.8, d: 1.3, h: 0.76 };
function table(g, e) {
  K.table(g, (e.id === 'table' ? TABLE.w : TABLE.d) / 2, TABLE.h, false);
  if (e.id === 'table') e.at(0, -TABLE.h, 'top');
}
const BOARDS = hex('#9c8268');
function top(g) {
  rect(g, -2, -2, 2, 2, BOARDS);
  for (let x = -0.4; x < 0.4; x += 0.2) rect(g, x - 0.004, -2, x + 0.004, 2, lerp(BOARDS, DARK, 0.35));
}
// [across, distance on the top from its near edge's middle, what]
const DISHES = [[-0.18, 0.35, 'bowl'], [0.12, 0.62, 'bottle'], [-0.12, 1.02, 'bowl']];
function dishes(g, e) {
  for (const [x, z, what] of DISHES) {
    e.part(x, z, (pg) => (what === 'bottle' ? bottle(pg, e) : bowl(pg)), [-0.16, -0.36, 0.16, 0.02]);
  }
}
// a clay bowl, its glaze dark green inside
function bowl(g) {
  g.beginPath();
  g.moveTo(-0.11, -0.07);
  g.quadraticCurveTo(-0.1, 0, -0.04, 0);
  g.lineTo(0.04, 0);
  g.quadraticCurveTo(0.1, 0, 0.11, -0.07);
  g.closePath();
  g.fillStyle = css(lerp(CLAY, DARK, 0.25));
  g.fill();
  g.beginPath();
  g.ellipse(0, -0.07, 0.11, 0.025, 0, 0, Math.PI * 2);
  g.fillStyle = css(GLAZE);
  g.fill();
}
// the bottle: ruby glass, its edge lit on the side the light comes from
function bottle(g, e) {
  const body = () => {
    g.beginPath();
    g.moveTo(-0.045, 0);
    g.lineTo(-0.05, -0.17);
    g.quadraticCurveTo(-0.05, -0.21, -0.016, -0.23);
    g.lineTo(-0.014, -0.3);
    g.lineTo(0.014, -0.3);
    g.lineTo(0.016, -0.23);
    g.quadraticCurveTo(0.05, -0.21, 0.05, -0.17);
    g.lineTo(0.045, 0);
    g.closePath();
  };
  body();
  g.fillStyle = css(RUBY);
  g.fill();
  const [l] = e.lights(0, -0.15);
  if (l && l.strength > 0.05) {
    g.save();
    body();
    g.clip();
    const side = Math.sign(l.x) || 1;
    const gr = g.createLinearGradient(-0.05 * side, 0, 0.05 * side, 0);
    gr.addColorStop(0, css(RUBY, 0));
    gr.addColorStop(1, css(hex('#e0485a'), clamp(l.strength)));
    g.fillStyle = gr;
    g.fillRect(-0.06, -0.31, 0.12, 0.32);
    g.restore();
  }
  rect(g, -0.016, -0.32, 0.016, -0.3, DARK);
  e.at(0, -0.3, 'bottle');
}
// a three-legged stool across the table from the bench; its seat a plane
const STOOL = { r: 0.18, h: 0.42 };
function stool(g, e) {
  rect(g, -STOOL.r, -STOOL.h, STOOL.r, -STOOL.h + 0.05, WOOD);
  for (const [x0, x1] of [[-0.14, -0.17], [0.14, 0.17], [-0.02, 0.02]]) {
    g.beginPath();
    g.moveTo(x0 - 0.02, -STOOL.h + 0.05);
    g.lineTo(x0 + 0.02, -STOOL.h + 0.05);
    g.lineTo(x1 + 0.02, 0);
    g.lineTo(x1 - 0.02, 0);
    g.closePath();
    g.fillStyle = css(DARK);
    g.fill();
  }
  e.at(0, -STOOL.h, 'seat');
}
function seat(g) {
  g.beginPath();
  g.arc(0, 0, STOOL.r, 0, Math.PI * 2);
  g.fillStyle = css(WOOD);
  g.fill();
}

// the blizzard out there (beyond the window, beyond the door) and, with the door open, blowing in
const STORM = { blizzard: [3, 3.2, 360, 7], blizzard_door: [3, 3.2, 360, 7], blizzard_in: [0.6, 1.8, 45, 2] };
function blizzard(g, e) {
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0) * (e.id === 'blizzard_in' ? clamp(s.door ?? 0) : 1);
  K.blizzard(g, e, STORM[e.id], storm);
}

// ── from frame to frame ─────────────────────────────────────────────────
// when the sneeze came (as `sneeze` comes up to 1): the sack's hop goes from there
let sneezeWas = null;
function beforeFrame({ t, state }) {
  const now = (state.sneeze ?? 0) >= 0.5;
  if (now && sneezeWas === false) sneezedAt = t;
  sneezeWas = now;
}

return {
  beforeFrame,
  wall: (g, e) => K.wall(g, ...WALLS[e.id], ROSE),
  floor,
  ceiling,
  lime: (g) => K.fill(g, LIME),
  stove,
  stoveSide,
  stoveBack,
  flue,
  sack,
  moon,
  soot,
  broom,
  bench: (g, e) => K.bench(g, e, 2.6),
  seat: (g) => K.fill(g, WOOD),
  table,
  top,
  dishes,
  stool,
  stoolSeat: seat,
  lamp: K.lamp,
  glass: (g) => K.pane(g, WINDOW),
  frame: (g, e) => K.frame(g, e, WINDOW),
  door: (g, e) => K.door(g, e, DOOR.w, DOOR.h),
  threshold: (g, e) => K.threshold(g, e, 1),
  drift: K.drift,
  sky: K.sky,
  snow: (g, e) => K.snow(g, e, [-3.2, -3.2, 3.2, 3.2]),
  hut: K.hut,
  fence: K.fence,
  blizzard,
};
