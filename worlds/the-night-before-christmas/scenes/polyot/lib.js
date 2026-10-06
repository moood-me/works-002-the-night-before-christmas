// Полёт — the land the flyers pass over, the clouds they pass through, the sky round them.
//
// The camera stays where it is (raised by camera_h); the land comes to it: every thing below is a
// card at its own distance, which the scene's script sets from `progress` (`place`). Things are
// painted as seen from where the camera is now — from the field at eye level, or from the height.
//
// World: metres; a — to the right of the line of flight, d — ahead, h — up.
const { clamp, mix, span, hash } = anim;

// as scene.json has them: the eye, the horizon on screen. The camera looks around (`around`): the
// sky is the full circle, x 0…e.aspect all the way round, straight ahead in the middle.
const EYE = 1.7;
const HORIZON = 0.5;
const TAU = Math.PI * 2;

// the way from the field to the palace, metres: progress 0…1 brings the land this far
const ROUTE = 6000;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
const mul = (a, b) => a.map((v, i) => v * b[i]);
const times = (a, k) => a.map((v) => v * k);
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
const norm = (v) => times(v, 1 / Math.hypot(...v));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// the sky and the light it gives: the night with the moon, the night without it, the dawn
const MOODS = {
  night: { zen: '#040b26', high: '#0d1f52', low: '#2d4680', amb: '#1d335f' },
  dark: { zen: '#010207', high: '#02040c', low: '#080d1b', amb: '#03050c' },
  dawn: { zen: '#1a2a62', high: '#5d63a0', low: '#f2a68f', amb: '#7a76a2' },
};
const MOON_KEY = hex('#a8c0ec');
const MOON_DISC = hex('#f4f2ea');
const HALO = hex('#9db4ec');
const GLOW_DAWN = hex('#ff9d7c');
const WARM = hex('#ffb35c');

// what things are made of
const SNOW = hex('#eef2fa');
const LIME = hex('#d4cfc4');
const WOOD = hex('#3a2f28');
const SHINGLE = hex('#2c2726');
const EAVE = hex('#2e2a2a');
const NEEDLES = hex('#1d2a2a');
const HAY = hex('#9a8a70');
const WILLOW = hex('#7c776f');
const STUCCO = hex('#c9cdb8'); // the palace's pale walls
const STONE = hex('#8f8c88');
const DEEP = hex('#0b1530');

// the moon: far — a crescent high to the right; near (moon_near 1) — huge, beside the flyers.
// b — its bearing (radians, right of ahead), y — its height on screen, r — its radius.
// Its crescent is its disc less a disc offset toward MOON_TURN.
const MOON_FAR = { b: 0.3, y: 0.26, r: 0.075 };
const MOON_NEAR = { b: 0.5, y: 0.13, r: 0.27 };
const MOON_TURN = Math.atan2(-0.75, -0.66);
const HALO_FALL = [[0, 0.36], [0.1, 0.26], [0.2, 0.15], [0.36, 0.07], [0.6, 0.02], [1, 0]];
const GLOW_FALL = [[0, 1], [0.15, 0.6], [0.4, 0.22], [0.75, 0.05], [1, 0]];
const GLOW_B = 0.7; // the bearing the dawn comes up at
const ramp = (stops, u) => {
  if (u <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], span(u, stops[i - 1][0], stops[i][0]));
  }
  return stops[stops.length - 1][1];
};

// The light of the moment, from the state.
function env(s) {
  const moon = clamp(s.moon ?? 1);
  const dawn = clamp(s.dawn ?? 0);
  const near = clamp(s.moon_near ?? 0);
  const pick = (k) => lerp(lerp(hex(MOODS.dark[k]), hex(MOODS.night[k]), moon), hex(MOODS.dawn[k]), dawn);
  const E = { moon, dawn, near };
  for (const k of ['zen', 'high', 'low', 'amb']) E[k] = pick(k);
  const m = { b: mix(MOON_FAR.b, MOON_NEAR.b, near), y: mix(MOON_FAR.y, MOON_NEAR.y, near), r: mix(MOON_FAR.r, MOON_NEAR.r, near) };
  E.moonB = m.b;
  E.moonY = m.y;
  E.moonR = m.r;
  E.moonL = norm([Math.sin(m.b), Math.cos(m.b), HORIZON - m.y]);
  E.moonVis = moon * (1 - 0.7 * dawn);
  // the moon's glow is the night's: at dawn only the pale crescent stays
  E.haloK = moon * (1 - dawn) * (1 + 0.6 * near);
  E.moonKey = times(MOON_KEY, moon * (1 - 0.7 * dawn) * (1 + 0.35 * near));
  E.glow = times(GLOW_DAWN, 0.8 * dawn);
  E.stars = clamp(s.stars ?? 1);
  E.win = 1 - 0.5 * dawn;
  E.bounce = mul(SNOW, add(E.amb, E.moonKey, Math.max(0, E.moonL[2])));
  return E;
}

// A surface of `albedo` facing n (world, unit) in the light of the moment.
function shade(E, albedo, n) {
  const up = n[2];
  let c = times(E.amb, 0.55 + 0.45 * up);
  c = add(c, E.bounce, 0.3 * (1 - up));
  c = add(c, E.moonKey, Math.max(0, dot(n, E.moonL)));
  return mul(albedo, c);
}

// ── things ──────────────────────────────────────────────────────────────
// A part is a frustum: its footprint 2hx × 2hy at (x, y), from z0 up to z1 where it is kx, ky as
// wide (a box: 1, 1; a hip roof: a ridge, ky 0; a spire or a fir: 0, 0). side: what its sides are
// made of; top / under: its top and underside, if seen. Sides go round from the front (−y).
const part = (o) => ({ x: 0, y: 0, kx: 1, ky: 1, rot: 0, ...o });

// a хата: whitewashed walls, a hip roof of snow, a chimney, lit windows on its front
function khata(x, y, rot, s = 1, windows = 2) {
  const L = 8.5 * s;
  const W = 5.4 * s;
  const holes = [];
  for (let i = 0; i < windows; i++) holes.push({ side: 0, u: (i + 1) / (windows + 1), w: 0.9, z0: 1, z1: 1.8 });
  return [
    part({ x, y, rot, hx: L / 2, hy: W / 2, z0: 0, z1: 2.4, side: LIME, holes }),
    part({ x, y, rot, hx: L / 2 + 0.45, hy: W / 2 + 0.45, z0: 2.4, z1: 6, kx: 0.4, ky: 0, side: SNOW, under: EAVE }),
  ];
}
// a wooden church: a log frame, a roof tier, a dome
function tserkva(x, y, s = 1) {
  return [
    part({ x, y, hx: 3.5 * s, hy: 3.5 * s, z0: 0, z1: 8 * s, side: WOOD }),
    part({ x, y, hx: 4 * s, hy: 4 * s, z0: 8 * s, z1: 10.5 * s, kx: 0.5, ky: 0.5, side: SNOW, under: EAVE }),
    part({ x, y, hx: 2 * s, hy: 2 * s, z0: 10.5 * s, z1: 12 * s, side: WOOD }),
    part({ x, y, hx: 2.3 * s, hy: 2.3 * s, z0: 12 * s, z1: 16 * s, kx: 0.08, ky: 0.08, side: SHINGLE }),
  ];
}
// a fir: two tiers of dark needles under snow
function yalyna(x, y, h) {
  return [
    part({ x, y, hx: 0.22 * h, hy: 0.22 * h, z0: 0.05 * h, z1: 0.65 * h, kx: 0.25, ky: 0.25, rot: 45 * hash(x * 7 + y), side: NEEDLES }),
    part({ x, y, hx: 0.15 * h, hy: 0.15 * h, z0: 0.45 * h, z1: h, kx: 0, ky: 0, rot: 45 * hash(x + y * 3), side: NEEDLES }),
  ];
}
// a стог: hay under a cap of snow
function stog(x, y, s = 1) {
  // two turned frusta make it eight-sided: round enough
  return [0, 45].flatMap((rot) => [
    part({ x, y, rot, hx: 2 * s, hy: 2 * s, z0: 0, z1: 2 * s, kx: 1.1, ky: 1.1, side: HAY }),
    part({ x, y, rot, hx: 2.3 * s, hy: 2.3 * s, z0: 2 * s, z1: 4.4 * s, kx: 0.15, ky: 0.15, side: SNOW }),
  ]);
}
// a хутір: one hut alone in the steppe, a fir or two, a стог
function khutir(seed) {
  return [...khata(0, 0, 70 * (hash(seed, 1) - 0.5), 1, 2), ...yalyna(9, 6, 13), ...yalyna(-8, 9, 11), ...stog(14, -4, 0.8)];
}
// lone firs and стоги scattered over the steppe
function step(seed, n, width, depth) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = (hash(i, seed) - 0.5) * width;
    const y = depth * hash(i, seed + 1);
    items.push(...(hash(i, seed + 2) > 0.5 ? yalyna(x, y, 10 + 8 * hash(i, seed + 3)) : stog(x, y, 0.8 + 0.4 * hash(i, seed + 3))));
  }
  return items;
}
// a wattle fence along local y: a woven band and the stakes over it
function pleten(length) {
  const items = [];
  const n = Math.round(length / 0.45);
  for (let i = 0; i < n; i++) items.push({ band: [[0, i * 0.45, 0.15], [0, (i + 1) * 0.45, 0.15], [0, (i + 1) * 0.45, 0.8], [0, i * 0.45, 0.8]], mat: WILLOW });
  for (let i = 0; i <= n; i++) items.push({ line: [[0, i * 0.45, 0], [0.04 * (hash(i, 5) - 0.5), i * 0.45, 1.1 + 0.25 * hash(i, 6)]], w: 0.035, mat: WOOD });
  items.push({ line: [[0, 0, 0.83], [0, length, 0.83]], w: 0.07, mat: SNOW });
  return items;
}
// the palace: a long pale front of lit windows in rows, a snow roof, a cupola at either end
function palace() {
  const L = 180;
  const W = 34;
  const holes = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 30; i++) holes.push({ side: 0, u: (i + 0.5) / 30, w: 2.2, z0: 3 + row * 6.5, z1: 7 + row * 6.5 });
    for (let i = 0; i < 6; i++) holes.push({ side: 3, u: (i + 0.5) / 6, w: 2.2, z0: 3 + row * 6.5, z1: 7 + row * 6.5 });
  }
  const parts = [
    part({ hx: L / 2, hy: W / 2, z0: 0, z1: 21, side: STUCCO, holes }),
    part({ hx: L / 2 + 1, hy: W / 2 + 1, z0: 21, z1: 26, kx: 0.9, ky: 0.4, side: SNOW, under: EAVE }),
  ];
  for (const x of [-L / 2 + 12, L / 2 - 12, 0]) {
    parts.push(part({ x, y: -W / 2 + 6, hx: 6, hy: 6, z0: 21, z1: 29, side: STUCCO }));
    parts.push(part({ x, y: -W / 2 + 6, hx: 6.5, hy: 6.5, z0: 29, z1: 37, kx: 0.1, ky: 0.1, side: SHINGLE }));
  }
  return parts;
}

// Lanterns along a street of the city: posts with a warm light at the top
const lanterns = (x0, y0, x1, y1, n) => Array.from({ length: n }, (_, i) => {
  const u = i / Math.max(1, n - 1);
  return { lamp: [mix(x0, x1, u), mix(y0, y1, u), 4.5] };
});

// a village: huts scattered along a street (local y beyond the card's anchor), a church
function selo(seed, n, width, depth, church = true) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const side = i % 2 ? 1 : -1;
    const y = (depth * (i + 0.5)) / n + 6 * hash(i, seed);
    const x = side * (12 + width * 0.5 * hash(i, seed + 1));
    items.push(...khata(x, y, side * (60 + 30 * hash(i, seed + 2)), 0.9 + 0.2 * hash(i, seed + 3), 1 + Math.round(hash(i, seed + 4))));
  }
  if (church) items.push(...tserkva(0, depth * 0.55, 1.2));
  return items;
}
// a forest: firs, dense in the middle, thinning at the edges
function lis(seed, n, width, depth) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const u = hash(i, seed) * 2 - 1;
    const x = (u * Math.abs(u) * width) / 2;
    const y = depth * hash(i, seed + 1);
    items.push(...yalyna(x, y, 12 + 10 * hash(i, seed + 2)));
  }
  return items;
}
// a quarter of the city: stone blocks with lit windows, lanterns along the embankment
function misto(seed, n, width, depth) {
  const items = [];
  for (let i = 0; i < n; i++) {
    const x = (hash(i, seed) - 0.5) * width;
    const y = depth * hash(i, seed + 1);
    const L = 18 + 22 * hash(i, seed + 2);
    const holes = [];
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 6; k++) if (hash(i * 31 + row * 7 + k, seed + 3) > 0.35) holes.push({ side: 0, u: (k + 0.5) / 6, w: 1.6, z0: 2.5 + row * 4, z1: 5 + row * 4 });
    }
    items.push(part({ x, y, hx: L / 2, hy: 7, z0: 0, z1: 14, side: STONE, holes }));
    items.push(part({ x, y, hx: L / 2 + 0.5, hy: 7.5, z0: 14, z1: 17, kx: 0.9, ky: 0.3, side: SNOW, under: EAVE }));
  }
  items.push(...lanterns(-width / 2, depth + 10, width / 2, depth + 10, 9));
  return items;
}

// Things of the way: [across, distance at progress 0, what is there]. The distance of each is the
// state value `at_<id>`, set by the script as the land comes on: b − progress × ROUTE.
const LAND = {
  fence: [-6, 7, pleten(30)],
  haystack: [14, 70, [...stog(0, 0, 0.9), ...stog(9, 12, 0.75)]],
  dikanka: [-40, 420, [...selo(11, 18, 120, 240), ...tserkva(-20, 270, 1.5)]],
  steppe1: [20, 900, step(51, 26, 600, 400)],
  khutir1: [160, 1250, khutir(1)],
  haystacks: [55, 1400, [...stog(0, 0, 1.2), ...stog(14, 20, 1), ...stog(-9, 34, 1.1)]],
  steppe2: [-60, 1550, step(52, 30, 700, 500)],
  khutir2: [-220, 2050, khutir(2)],
  windmill: [-90, 1900, [part({ hx: 3, hy: 3, z0: 0, z1: 9, side: WOOD }), part({ hx: 3.4, hy: 3.4, z0: 9, z1: 12, kx: 0.1, ky: 0.1, side: SNOW }), ...[0, 1, 2, 3].map((k) => ({ line: [[0, -3.5, 9], [9 * Math.cos(k * 1.571 + 0.4), -3.5, 9 + 9 * Math.sin(k * 1.571 + 0.4)]], w: 0.5, mat: WOOD }))]],
  forest1: [-150, 2300, lis(21, 90, 260, 260)],
  forest2: [70, 2700, lis(22, 70, 200, 220)],
  forest3: [-40, 3100, lis(23, 80, 240, 240)],
  village1: [-110, 3650, selo(31, 16, 80, 180)],
  village2: [60, 4250, selo(32, 18, 90, 200)],
  steppe3: [40, 3250, step(53, 26, 600, 350)],
  village3: [-70, 4850, selo(33, 9, 60, 130, false)],
  khutir3: [190, 5050, khutir(3)],
  steppe4: [-30, 4500, step(54, 24, 500, 300)],
  steppe5: [20, 5150, step(55, 20, 500, 250)],
  city1: [-170, 5450, misto(41, 22, 240, 300)],
  city2: [-20, 5800, misto(42, 18, 200, 260)],
  palace: [45, 6420, palace()],
  city3: [-160, 6550, misto(43, 26, 260, 320)],
};

// clouds: [across, distance at progress 0, height above the ground, width, seed]
const CLOUDS = {
  cloud1: [-140, 600, 170, 260, 1],
  cloud2: [170, 1000, 70, 200, 2],
  cloud3: [-60, 1600, 60, 240, 3],
  cloud4: [110, 2200, 175, 300, 4],
  cloud5: [-210, 2850, 75, 260, 5],
  cloud6: [40, 3500, 65, 220, 6],
  cloud7: [-100, 4300, 170, 320, 7],
  cloud8: [150, 5100, 80, 260, 8],
};

// the frozen river the flight follows, to the right, all the way to the city: [across, width]
const RIVER = [140, 55];

// Where each thing is now: the script sets at_<id> from this.
const FLOW = [...Object.entries(LAND).map(([id, [, b]]) => [`at_${id}`, b]), ...Object.entries(CLOUDS).map(([id, [, b]]) => [`at_${id}`, b])];
const distanceOf = (b, progress) => b - progress * ROUTE;

// ── drawing a thing as the camera sees it ───────────────────────────────
// A card at (A, D) on the ground, the eye `Hc` high: where a point of the world is on the card
// (metres from its anchor, y down) and how much a metre there is scaled.
const card = (A, D, Hc) => ({
  eye: [0, 0, Hc],
  p: ([a, d, h]) => [(a * D) / d - A, (D * (Hc - h)) / d - Hc, D / d],
});

// faces of a part in the world, for a thing standing at (A, D)
function faces(pt, A, D) {
  const r = (pt.rot * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const at = (x, y, z) => [A + pt.x + x * c - y * s, D + pt.y + x * s + y * c, z];
  const ring = (z, kx, ky) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => at(u * pt.hx * kx, v * pt.hy * ky, z));
  const B = ring(pt.z0, 1, 1);
  const U = ring(pt.z1, pt.kx, pt.ky);
  const centre = at(0, 0, (pt.z0 + pt.z1) / 2);
  const list = [];
  for (let i = 0; i < 4; i++) list.push({ pts: [B[i], B[(i + 1) % 4], U[(i + 1) % 4], U[i]], mat: pt.side, side: i, B, holes: pt.holes });
  if (pt.top) list.push({ pts: U, mat: pt.top });
  if (pt.under) list.push({ pts: [...B].reverse(), mat: pt.under });
  for (const f of list) {
    const m = f.pts.reduce((q, v) => add(q, v), [0, 0, 0]).map((v) => v / f.pts.length);
    const [p0, p1, , p3] = f.pts;
    const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const e2 = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
    let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    n = Math.hypot(...n) < 1e-9 ? [0, 0, 1] : norm(n);
    if (dot(n, [m[0] - centre[0], m[1] - centre[1], m[2] - centre[2]]) < 0) n = times(n, -1);
    f.n = n;
    f.mid = m;
  }
  return { centre, list };
}

function poly(g, V, pts) {
  g.beginPath();
  pts.forEach((v, i) => {
    const [x, y] = V.p(v);
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  });
  g.closePath();
}

// a window on a wall: warm glass and its glow
function hole(g, V, E, f, h, e) {
  const [A, B] = [f.B[h.side], f.B[(h.side + 1) % 4]];
  const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const on = (u, z) => [mix(A[0], B[0], u), mix(A[1], B[1], u), A[2] + z];
  const u0 = h.u - h.w / 2 / len;
  const u1 = h.u + h.w / 2 / len;
  poly(g, V, [on(u0, h.z0), on(u1, h.z0), on(u1, h.z1), on(u0, h.z1)]);
  g.fillStyle = css(lerp(DEEP, WARM, E.win));
  g.fill();
  if (E.win > 0.01) {
    const [cx, cy, k] = V.p(on(h.u, (h.z0 + h.z1) / 2));
    e.light(cx, cy, Math.max(h.w * k * 2.2, 1.6 * e.px), '#ff9a48', 0.7 * E.win);
  }
}

// One thing seen from the camera: the faces that look at the eye, far ones first; lines; lamps.
function drawThing(g, items, V, E, e) {
  for (const it of items) {
    if (!it.band) continue;
    poly(g, V, it.band.map(([x, y, z]) => [V.A + x, V.D + y, z]));
    g.fillStyle = css(shade(E, it.mat, [-1, 0, 0]));
    g.fill();
  }
  const placed = items.filter((it) => !it.line && !it.lamp && !it.band).map((pt) => faces(pt, V.A, V.D));
  placed.sort((p, q) => dist(V.eye, q.centre) - dist(V.eye, p.centre));
  for (const { list } of placed) {
    for (const f of list) {
      const toEye = [V.eye[0] - f.mid[0], V.eye[1] - f.mid[1], V.eye[2] - f.mid[2]];
      if (dot(f.n, toEye) <= 0) continue;
      poly(g, V, f.pts);
      const col = css(shade(E, f.mat, f.n));
      g.fillStyle = col;
      g.strokeStyle = col;
      g.lineWidth = e.px;
      g.fill();
      g.stroke();
      for (const h of f.holes || []) if (h.side === f.side) hole(g, V, E, f, h, e);
    }
  }
  g.lineCap = 'round';
  for (const it of items) {
    if (it.line) {
      const [p, q] = it.line.map(([x, y, z]) => V.p([V.A + x, V.D + y, z]));
      g.strokeStyle = css(shade(E, it.mat, [0, -1, 0]));
      g.lineWidth = it.w * (p[2] + q[2]) * 0.5;
      g.beginPath();
      g.moveTo(p[0], p[1]);
      g.lineTo(q[0], q[1]);
      g.stroke();
    } else if (it.lamp) {
      const [x, y, z] = it.lamp;
      const [px, py, k] = V.p([V.A + x, V.D + y, z]);
      const [bx, by] = V.p([V.A + x, V.D + y, 0]);
      g.strokeStyle = css(shade(E, WOOD, [0, -1, 0]));
      g.lineWidth = 0.15 * k;
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(px, py);
      g.stroke();
      g.fillStyle = css(WARM);
      g.beginPath();
      g.arc(px, py, 0.35 * k, 0, Math.PI * 2);
      g.fill();
      e.light(px, py, 5 * k, '#ffa24c', 0.7);
    }
  }
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// A thing of the land on its card (its element's id names it): where it is now, as seen now.
function land(g, e) {
  const [A, b, items] = LAND[e.id];
  const s = e.state;
  const D = s[`at_${e.id}`] ?? b;
  if (D < 1) return;
  drawThing(g, items, { ...card(A, D, EYE + (s.camera_h ?? 0)), A, D }, env(s), e);
}

// ── clouds ──────────────────────────────────────────────────────────────
// a cloud: soft lobes, lit at their tops by the moon, darker beneath
function cloud(g, e) {
  const [, b, , width, seed] = CLOUDS[e.id];
  const s = e.state;
  const D = s[`at_${e.id}`] ?? b;
  if (D < 1) return;
  const E = env(s);
  const lit = add(times(E.amb, 1.1), E.moonKey, 0.75);
  const dark = times(E.amb, 0.7);
  // a few long, soft layers, lit along their tops
  for (let i = 0; i < 6; i++) {
    const x = (hash(i, seed) - 0.5) * width * 0.5;
    const y = (hash(i, seed + 1) - 0.5) * width * 0.06;
    const r = width * (0.25 + 0.2 * hash(i, seed + 2));
    g.save();
    g.translate(x, y);
    g.scale(1, 0.16 + 0.08 * hash(i, seed + 3));
    const gr = g.createRadialGradient(0, -r * 0.25, 0, 0, 0, r);
    gr.addColorStop(0, css(lit, 0.34));
    gr.addColorStop(0.55, css(lerp(lit, dark, 0.5), 0.2));
    gr.addColorStop(1, css(dark, 0));
    g.fillStyle = gr;
    g.fillRect(-r, -r, 2 * r, 2 * r);
    g.restore();
  }
}

// ── the ground and the river ────────────────────────────────────────────
// the snow, all of it alike: what passes below is the things on it (planes in bands of distance,
// so the air thickens smoothly over them)
function ground(g, e) {
  const E = env(e.state);
  g.fillStyle = css(shade(E, SNOW, [0, 0, 1]));
  g.fillRect(-1e6, -1e6, 2e6, 2e6);
}
// the river: dark ice, edged by the snow of its banks
function river(g, e) {
  const E = env(e.state);
  const [, w] = RIVER;
  g.fillStyle = css(lerp(DEEP, E.high, 0.2));
  g.fillRect(-w / 2, -1e6, w, 2e6);
  g.fillStyle = css(shade(E, SNOW, norm([0, -0.4, 0.9])));
  for (const x of [-w / 2, w / 2 - 4]) g.fillRect(x, -1e6, 4, 2e6);
}

// ── the sky ─────────────────────────────────────────────────────────────
// the sky above the horizon (below it the land, and the sky mirrored where the ice lets it show)
function sky(g, e) {
  const E = env(e.state);
  const x0 = 0;
  const x1 = e.aspect;
  const gr = g.createLinearGradient(0, -0.35, 0, HORIZON);
  gr.addColorStop(0, css(E.zen));
  gr.addColorStop(span(0.15, -0.35, HORIZON), css(E.high));
  gr.addColorStop(1, css(E.low));
  g.fillStyle = gr;
  g.fillRect(x0, -0.35, x1 - x0, HORIZON + 0.35);
  if (E.dawn > 0.01) {
    g.save();
    g.beginPath();
    g.rect(x0, -0.35, x1 - x0, HORIZON + 0.35);
    g.clip();
    g.translate(e.aspect / 2 + (GLOW_B * e.aspect) / TAU, HORIZON);
    g.scale(2.6, 1);
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 0.75);
    for (const [u, v] of GLOW_FALL) glow.addColorStop(u, css(E.glow, v));
    g.fillStyle = glow;
    g.fillRect(-0.75, -0.75, 1.5, 1.5);
    g.restore();
  }
}

// stars: the dimmer go first as `stars` falls, and as the dawn comes they go out one by one
function stars(g, e) {
  const E = env(e.state);
  const left = E.stars * (1 - E.dawn);
  if (left <= 0.001) return;
  const [mx, my] = moonAt(E, e);
  for (let i = 0; i < 1400; i++) {
    const x = e.aspect * hash(i, 21);
    const y = -0.35 + (HORIZON + 0.33) * hash(i, 22) ** 1.5;
    const b = hash(i, 23) ** 3;
    // each star goes out at its own moment: the dimmest first
    const keep = clamp((left - (1 - b) * 0.98) * 40 + 1);
    const nearMoon = 1 - 2.4 * E.haloK * ramp(HALO_FALL, Math.hypot(x - mx, y - my) / (E.moonR * 10));
    const low = span(y, HORIZON - 0.02, HORIZON - 0.15);
    const alpha = keep * clamp(nearMoon) * low * (0.25 + 0.75 * b);
    if (alpha < 0.02) continue;
    const r = 0.0007 + 0.0018 * b;
    g.fillStyle = css(lerp([0.8, 0.86, 1], [1, 0.95, 0.85], hash(i, 24)), alpha);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
}

// where the moon is on the sky's full circle
const moonAt = (E, e) => [e.aspect / 2 + (E.moonB * e.aspect) / TAU, E.moonY];

// the moon: the air it lights, then the crescent glowing softly at its edge
function moon(g, e) {
  const E = env(e.state);
  if (E.moonVis <= 0.001) return;
  const [x, y] = moonAt(E, e);
  const R = E.moonR;
  const lx = x - 0.55 * R * Math.cos(MOON_TURN);
  const ly = y - 0.55 * R * Math.sin(MOON_TURN);
  const reach = R * 10;
  const halo = g.createRadialGradient(lx, ly, 0, lx, ly, reach);
  for (const [u, v] of HALO_FALL) halo.addColorStop(u, css(HALO, v * E.haloK));
  g.fillStyle = halo;
  g.fillRect(lx - reach, ly - reach, 2 * reach, 2 * reach);
  const D = 0.4 * R;
  const r = 0.93 * R;
  const al = Math.acos((R * R + D * D - r * r) / (2 * R * D));
  const be = Math.acos((r * r + D * D - R * R) / (2 * r * D));
  const ox = x + D * Math.cos(MOON_TURN);
  const oy = y + D * Math.sin(MOON_TURN);
  g.beginPath();
  g.arc(x, y, R, MOON_TURN + al, MOON_TURN + 2 * Math.PI - al, false);
  g.arc(ox, oy, r, MOON_TURN + Math.PI + be, MOON_TURN + Math.PI - be, true);
  g.closePath();
  g.shadowColor = css(hex('#c9d6ff'), 0.8 * E.haloK);
  g.shadowBlur = ((0.035 + 0.06 * E.near) * E.haloK) / e.px;
  g.fillStyle = css(MOON_DISC, E.moonVis);
  g.fill();
  g.shadowBlur = 0;
}

return { ROUTE, FLOW, distanceOf, land, cloud, ground, river, sky, stars, moon };
