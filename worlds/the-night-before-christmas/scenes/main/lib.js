// Диканька — one small model of the village, painted three ways: each thing on its own card (as seen
// from the start), mirrored in the ice of the street, and as shadows on the snow. Everything is
// lit by one light model that follows the state (moon, dawn, morning, blizzard, windows).
//
// World: metres; a — to the right of the start's line of sight, d — ahead, h — up. The eye is at
// (0, 0, EYE). A thing's own (local) x, y turn by `rot` degrees and sit at (a, d).
const { clamp, mix, span, hash } = anim;

// as scene.json has them: the eye, the horizon on screen, the stage
const EYE = 1.7;
const HORIZON = 0.64;
const STAGE = 16 / 9;
const AIR = 393; // metres: the air's own haze (h = 1 − e^(−d/AIR)); light.haze is 0, light.hazeColor its mean

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
const mul = (a, b) => a.map((v, i) => v * b[i]);
const times = (a, k) => a.map((v) => v * k);
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
const ramp = (stops, u) => {
  if (u <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], span(u, stops[i - 1][0], stops[i][0]));
  }
  return stops[stops.length - 1][1];
};

// the sky and the light it gives, for each mood the state mixes
const MOODS = {
  night: { zen: '#050d2a', high: '#0f2257', low: '#33508c', amb: '#1d335f' },
  dark: { zen: '#010207', high: '#02040c', low: '#080d1b', amb: '#03050c' },
  dawn: { zen: '#18245a', high: '#5a5a96', low: '#f3a58e', amb: '#77709c' },
  morning: { zen: '#4a7fcb', high: '#9bbfe8', low: '#f8dcc8', amb: '#a9bde2' },
};
const MOON_KEY = hex('#a8c0ec');
const SUN_KEY = hex('#ffc9a4');
const MOON_DISC = hex('#f4f2ea');
const HALO = hex('#9db4ec');
const GLOW_DAWN = hex('#ff9d7c');
const GLOW_DAY = hex('#fff1da');
const WARM = hex('#ffb35c');
const WARM_DEEP = hex('#e8742c');

// what things are made of
const SNOW = hex('#eef2fa');
const LIME = hex('#d4cfc4'); // whitewashed walls
const WOOD = hex('#3a2f28');
const WATTLE = hex('#4a3f37');
const WILLOW = hex('#7c776f');
const SHINGLE = hex('#2c2726');
const EAVE = hex('#2e2a2a');
const POPLAR = hex('#1a1d24');
const DEEP = hex('#0b1530');

// the sun of Christmas morning, low to the right; the moon where the state has it
const SUN = { x: 0.84, y: 0.5 };
// the moon's halo (fraction of its radius → strength) and the morning glow on the horizon
const HALO_R = 0.95;
const HALO_FALL = [[0, 0.6], [0.08, 0.42], [0.16, 0.24], [0.32, 0.1], [0.6, 0.03], [1, 0]];
const GLOW_R = 0.75;
const GLOW_FALL = [[0, 1], [0.15, 0.6], [0.4, 0.22], [0.75, 0.05], [1, 0]];

const norm = (v) => times(v, 1 / Math.hypot(...v));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// The light of the moment, from the state.
function env(s) {
  const moon = clamp(s.moon ?? 1);
  const dawn = clamp(s.dawn ?? 0);
  const morning = clamp(s.morning ?? 0);
  const storm = clamp(s.blizzard ?? 0);
  const pick = (k) => {
    let c = lerp(hex(MOODS.dark[k]), hex(MOODS.night[k]), moon);
    c = lerp(c, hex(MOODS.dawn[k]), dawn * (1 - morning));
    return lerp(c, hex(MOODS.morning[k]), morning);
  };
  const E = { moon, dawn, morning, storm };
  E.amb = pick('amb');
  E.low = pick('low');
  E.fog = add(times(lerp(E.low, E.amb, 0.5), 1.1), hex('#0b1020'));
  E.zen = lerp(pick('zen'), E.fog, storm * 0.85);
  E.high = lerp(pick('high'), E.fog, storm * 0.9);
  E.low = lerp(E.low, E.fog, storm * 0.9);
  E.amb = lerp(E.amb, E.fog, storm * 0.4);

  const mx = s.moon_x ?? 0.4;
  const my = s.moon_y ?? 0.2;
  E.moonAt = [mx * STAGE, my];
  E.moonL = norm([(mx - 0.5) * STAGE, 1, HORIZON - my]);
  E.moonVis = moon * (1 - 0.5 * dawn) * (1 - 0.7 * morning) * (1 - 0.75 * storm);
  E.moonKey = times(MOON_KEY, moon * (1 - 0.7 * dawn) * (1 - morning) * (1 - 0.85 * storm));
  E.haloK = E.moonVis * (1 - 0.6 * morning);
  E.sunAt = [SUN.x * STAGE, SUN.y];
  E.sunL = norm([(SUN.x - 0.5) * STAGE, 1, HORIZON - SUN.y]);
  E.sunKey = times(SUN_KEY, 1.5 * morning * (1 - 0.8 * storm));
  E.sunVis = morning * (1 - 0.8 * storm);
  E.glow = times(lerp(GLOW_DAWN, GLOW_DAY, morning), Math.max(dawn * 0.75, morning * 0.6) * (1 - 0.7 * storm));
  E.win = clamp(s.windows ?? 1) * (1 - 0.85 * morning) * (1 - 0.3 * dawn);
  E.stars = clamp(s.stars ?? 1) * (1 - dawn) * (1 - morning) * (1 - storm);
  E.bounce = mul(SNOW, add(add(E.amb, E.moonKey, Math.max(0, E.moonL[2])), E.sunKey, Math.max(0, E.sunL[2])));
  // the light that casts shadows and makes the snow glint: [direction, how strong, colour]
  E.lights = [
    [E.moonL, moon * (1 - 0.7 * dawn) * (1 - morning) * (1 - 0.85 * storm), MOON_KEY, 'moonKey'],
    [E.sunL, morning * (1 - 0.8 * storm), SUN_KEY, 'sunKey'],
  ];
  return E;
}

// The sky seen at (x, y) — stage heights from its top-left corner: the gradient, the moon's halo,
// the glow of the dawn. The sky element paints the same with canvas gradients; the ice reads it.
function skyAt(E, x, y) {
  let c = y < 0.22 ? lerp(E.zen, E.high, span(y, -0.35, 0.22)) : lerp(E.high, E.low, span(y, 0.22, HORIZON));
  c = lerp(c, HALO, E.haloK * ramp(HALO_FALL, Math.hypot(x - E.moonAt[0], y - E.moonAt[1]) / HALO_R));
  return add(c, E.glow, ramp(GLOW_FALL, Math.hypot((x - E.sunAt[0]) / 2.6, y - HORIZON) / GLOW_R));
}

// Air between the eye and a thing d metres away: the haze toward the horizon's colour, and the
// blizzard's snow.
const fogOf = (E, d) => E.storm * (1 - Math.exp(-d / 16));
function air(E, c, d) {
  const h = 1 - Math.exp(-d / AIR);
  return lerp(lerp(c, E.low, h), E.fog, fogOf(E, d));
}

// A surface of `albedo` facing n (world, unit), d metres away, in the light of the moment.
function shade(E, albedo, n, d, skip) {
  const up = n[2];
  let c = times(E.amb, 0.55 + 0.45 * up);
  c = add(c, E.bounce, 0.3 * (1 - up));
  for (const [L, , , key] of E.lights) {
    if (key !== skip) c = add(c, E[key], Math.max(0, dot(n, L)));
  }
  return air(E, mul(albedo, c), d);
}

// ── the village ─────────────────────────────────────────────────────────
// A part is a frustum: its footprint 2hx × 2hy at (x, y), from z0 up to z1 where it is kx, ky as
// wide (a box: 1, 1; a hip roof: a ridge, ky 0; a spire: 0, 0). side: what its sides are made of,
// top / under: its top and its underside, if they are seen. Sides go round from the front (−y).
const part = (o) => ({ x: 0, y: 0, kx: 1, ky: 1, ...o });

// A хата: whitewashed walls, a hip roof of snow, a chimney; windows and a door on its sides.
function khata({ a, d, rot, L, W, eave = 2.4, ridge = 6, chimney, windows = [], door, frost, walls = LIME }) {
  const o = 0.45;
  const R = L + 2 * o;
  const parts = [
    part({ hx: L / 2, hy: W / 2, z0: 0, z1: eave, side: walls }),
    part({ hx: R / 2, hy: W / 2 + o, z0: eave, z1: ridge, kx: Math.max(0.05, (L - W * 0.85) / R), ky: 0, side: SNOW, under: EAVE }),
  ];
  if (chimney) {
    const [x, y, top] = chimney;
    parts.push(part({ x, y, hx: 0.42, hy: 0.42, z0: eave + 1, z1: top, side: walls, top: SNOW, chimney: true }));
  }
  const holes = windows.map(([side, u, w = 0.9]) => ({ side, u, w, z0: 1, z1: 1.85, frost }));
  if (door) holes.push({ side: door[0], u: door[1], w: door[2] ?? 1, z0: 0, z1: 1.95, door: true });
  return { a, d, rot, parts, holes, lines: [], shapes: [] };
}

// Чуб's: close on the left, its front turned to the street; the frosted window, the door.
const CHUB = khata({ a: -11, d: 17, rot: 52, L: 9.5, W: 6.2, eave: 2.6, ridge: 6.8, chimney: [1.6, 1.0, 7.9], windows: [[0, 0.27, 1.0], [0, 0.5, 1.0]], door: [0, 0.76, 1.05], frost: true });
// Солоха's: farther, on the right, its tall chimney.
const SOLOKHA = khata({ a: 13.5, d: 35, rot: -38, L: 9, W: 5.6, eave: 2.4, ridge: 6.1, chimney: [-1.4, 0.9, 8.8], windows: [[0, 0.3], [0, 0.56], [3, 0.5, 0.8]], door: [0, 0.82] });
// the smithy: dark timber, low, its wide doors to the road
const KUZNYA = khata({ a: 25, d: 45, rot: -12, L: 7.5, W: 5.4, eave: 2.9, ridge: 4.6, chimney: [-2.2, 1.0, 6.6], door: [0, 0.4, 2.2], walls: WOOD });
// the street's other houses, smaller as they go up to the church
const HUTS = [
  khata({ a: -13.5, d: 52, rot: 26, L: 8.5, W: 5.4, chimney: [1, 0.8, 7], windows: [[0, 0.35], [0, 0.62]] }),
  khata({ a: 11.5, d: 61, rot: -28, L: 8, W: 5.2, chimney: [-1, 0.8, 6.8], windows: [[0, 0.4], [0, 0.66]] }),
  khata({ a: -12.5, d: 74, rot: 22, L: 8, W: 5.2, chimney: [0.8, 0.8, 6.8], windows: [[0, 0.5]] }),
  khata({ a: 13, d: 86, rot: -20, L: 8, W: 5.2, windows: [[0, 0.45], [0, 0.7]] }),
  khata({ a: -21, d: 104, rot: 14, L: 8, W: 5.2, chimney: [0.8, 0.8, 6.8], windows: [[0, 0.55]] }),
  khata({ a: 27, d: 101, rot: -16, L: 8, W: 5.2, windows: [[0, 0.4]] }),
];

// The church on its hill: three log frames in a row, each under tiers of roof and a dome.
const HILL_TOP = 10;
function church() {
  const parts = [];
  const lines = [];
  for (const [x, s] of [[-6.3, 0.8], [0, 1], [6.3, 0.8]]) {
    const h = 7.5 * s;
    parts.push(part({ x, hx: 3.1 * s, hy: 3.1 * s, z0: 0, z1: h, side: WOOD }));
    parts.push(part({ x, hx: 3.6 * s, hy: 3.6 * s, z0: h, z1: h + 2.3 * s, kx: 0.55, ky: 0.55, side: SNOW, under: EAVE }));
    parts.push(part({ x, hx: 1.85 * s, hy: 1.85 * s, z0: h + 2.3 * s, z1: h + 3.8 * s, side: WOOD }));
    parts.push(part({ x, hx: 2.15 * s, hy: 2.15 * s, z0: h + 3.8 * s, z1: h + 6.8 * s, kx: 0.1, ky: 0.1, side: SHINGLE, under: EAVE }));
    lines.push({ p: [x, 0, h + 6.8 * s], q: [x, 0, h + 9.2 * s], w: 0.14, mat: SHINGLE });
    lines.push({ p: [x - 0.7 * s, 0, h + 8.4 * s], q: [x + 0.7 * s, 0, h + 8.4 * s], w: 0.12, mat: SHINGLE });
  }
  return { a: 7, d: 128, e: HILL_TOP, rot: 0, parts, holes: [], lines, shapes: [] };
}
const CHURCH = church();

// the hill under it: a long, soft rise of snow
const HILL = (() => {
  const top = [];
  for (let i = 0; i <= 40; i++) {
    const x = -75 + (150 * i) / 40;
    const u = x / 75;
    top.push([x, 0, HILL_TOP * (1 - u * u) ** 2]);
  }
  return { a: 7, d: 125, rot: 0, parts: [], holes: [], lines: [], shapes: [{ pts: [...top, [75, 0, 0], [-75, 0, 0]], mat: SNOW, n: [0, -0.35, 0.94] }] };
})();

// poplars: tall dark spindles
function poplar(a, d, h) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    pts.push([0.16 * h * Math.sin(Math.PI * u ** 0.75) * 0.5, 0, h * u]);
  }
  const back = pts.map(([x, y, z]) => [-x, y, z]).reverse();
  return { a, d, rot: 0, parts: [], holes: [], lines: [], shapes: [{ pts: [...pts, ...back], mat: POPLAR, n: [0, -1, 0] }] };
}
const POPLARS = [poplar(-7, 121, 19), poplar(-3.5, 124, 15), poplar(22, 117, 17)];

// The well's crane: a post, the long pole across the sky, its rope down to the well.
const ZHURAVEL = (() => {
  const post = [4.4, 0.3];
  const pivot = 3.9;
  const dir = norm([-4.4, 0, 6.4]);
  const tip = [post[0] + dir[0] * 7.6, 0, pivot + dir[2] * 7.6];
  const butt = [post[0] - dir[0] * 3.2, 0, pivot - dir[2] * 3.2];
  return {
    a: 6.4,
    d: 19.5,
    rot: -8,
    parts: [part({ hx: 0.48, hy: 0.48, z0: 0, z1: 0.7, side: WATTLE, top: SNOW })],
    holes: [],
    lines: [
      { p: [post[0], post[1], 0], q: [post[0], post[1], pivot + 0.25], w: 0.2, mat: WOOD },
      { p: butt, q: tip, w: 0.085, mat: WOOD },
      { p: tip, q: [tip[0], 0, 0.75], w: 0.02, mat: WOOD },
      { p: [butt[0], 0, butt[2] + 0.2], q: [butt[0], 0, butt[2] - 0.35], w: 0.32, mat: WOOD },
    ],
    shapes: [],
  };
})();

// Чуб's wattle fence: a woven band, thin stakes rising out of it, snow along its top; a gate
// opposite the door.
const PLETEN = (() => {
  const lines = [];
  const shapes = [];
  const run = (from, to, step) => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const n = Math.round(len / step);
    const dir = [(to[0] - from[0]) / len, (to[1] - from[1]) / len];
    const face = dir[1] > 0.5 ? [1, 0, 0] : [0, -1, 0];
    const at = (u) => [mix(from[0], to[0], u), mix(from[1], to[1], u)];
    for (let i = 0; i < n; i++) {
      const [x0, y0] = at(i / n);
      const [x1, y1] = at((i + 1) / n);
      shapes.push({ pts: [[x0, y0, 0.14], [x1, y1, 0.14], [x1, y1, 0.74], [x0, y0, 0.74]], mat: WILLOW, n: face });
    }
    for (let i = 0; i <= n; i++) {
      const [x, y] = at(i / n);
      const lean = 0.05 * (hash(i, from[1] * 7 + 1) - 0.5);
      lines.push({ p: [x, y, 0], q: [x + lean, y, 1.1 + 0.25 * hash(i, from[1] * 7)], w: 0.032, mat: WATTLE });
    }
    lines.push({ p: [...from, 0.77], q: [...to, 0.77], w: 0.07, mat: SNOW, snow: true });
  };
  run([-16, 9.2], [-5.4, 8.4], 0.42);
  run([-5.4, 8.4], [-4.9, 14.3], 0.42);
  run([-4.8, 16.6], [-4.4, 25], 0.42);
  for (const [x, d] of [[-4.9, 14.3], [-4.8, 16.6]]) lines.push({ p: [x, d, 0], q: [x, d, 1.5], w: 0.11, mat: WOOD });
  return { a: 0, d: 0, at: [-5.4, 8.4], rot: 0, parts: [], holes: [], lines, shapes };
})();

// the things, by the ids of their elements
const WORLD = { chub: CHUB, solokha: SOLOKHA, smithy: KUZNYA, church: CHURCH, hill: HILL, well: ZHURAVEL, fence: PLETEN };
HUTS.forEach((h, i) => (WORLD[`hut${i + 1}`] = h));
POPLARS.forEach((p, i) => (WORLD[`poplar${i + 1}`] = p));

// ── geometry in the world ───────────────────────────────────────────────
const placed = new Map();
function inWorld(T) {
  if (placed.has(T)) return placed.get(T);
  const r = ((T.rot || 0) * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const E0 = T.e || 0;
  const at = ([x, y, z]) => [T.a + x * c - y * s, T.d + x * s + y * c, E0 + z];
  const faces = [];
  const solids = T.parts.map((p, pi) => {
    const corners = (z, k) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => at([p.x + u * p.hx * k[0], p.y + v * p.hy * k[1], z]));
    const B = corners(p.z0, [1, 1]);
    const U = corners(p.z1, [p.kx, p.ky]);
    const centre = at([p.x, p.y, (p.z0 + p.z1) / 2]);
    const list = [];
    for (let i = 0; i < 4; i++) list.push({ pts: [B[i], B[(i + 1) % 4], U[(i + 1) % 4], U[i]], mat: p.side, side: i, part: pi });
    if (p.top) list.push({ pts: U, mat: p.top });
    if (p.under) list.push({ pts: [...B].reverse(), mat: p.under });
    for (const f of list) {
      const m = f.pts.reduce((q, v) => add(q, v), [0, 0, 0]).map((v) => v / f.pts.length);
      const [p0, p1, , p3] = f.pts;
      const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      const e2 = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
      let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      if (Math.hypot(...n) < 1e-9) n = [0, 0, 1];
      n = norm(n);
      if (dot(n, [m[0] - centre[0], m[1] - centre[1], m[2] - centre[2]]) < 0) n = times(n, -1);
      f.n = n;
      f.mid = m;
    }
    // which face is across each edge: an edge between a face seen and one turned to the light
    // behind it is where the snow catches the light (a rim)
    const id = (v) => v.map((x) => x.toFixed(3)).join(',');
    const across = new Map();
    for (const f of list) {
      f.edges = [];
      f.pts.forEach((v, j) => {
        const w = f.pts[(j + 1) % f.pts.length];
        if (id(v) === id(w)) return;
        const k = [id(v), id(w)].sort().join('|');
        const edge = { v, w, f };
        f.edges.push(edge);
        if (across.has(k)) {
          const other = across.get(k);
          other.nb = f;
          edge.nb = other.f;
        } else across.set(k, edge);
      });
    }
    faces.push(...list);
    return { centre, faces: list, B, chimney: p.chimney ? at([p.x, p.y, p.z1]) : null, U };
  });
  // windows and the door: on the walls (the first part), u along a side, z0…z1 up it
  const holes = T.holes.map((h) => {
    const A = solids[0].B[h.side];
    const B = solids[0].B[(h.side + 1) % 4];
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const u0 = h.u - h.w / 2 / len;
    const u1 = h.u + h.w / 2 / len;
    const on = (u, z) => [mix(A[0], B[0], u), mix(A[1], B[1], u), A[2] + z];
    return { ...h, pts: [on(u0, h.z0), on(u1, h.z0), on(u1, h.z1), on(u0, h.z1)], n: solids[0].faces[h.side].n, at: on(h.u, (h.z0 + h.z1) / 2) };
  });
  const lines = T.lines.map((l) => ({ ...l, p: at(l.p), q: at(l.q) }));
  const shapes = T.shapes.map((sh) => ({ ...sh, pts: sh.pts.map(at) }));
  const chimney = solids.find((s) => s.chimney)?.chimney;
  const W = { solids, holes, lines, shapes, chimney };
  placed.set(T, W);
  return W;
}

// How a view sees the world: a card standing at (A0, D0, E0), as from the start — [x, y, how much
// a metre there is scaled]; or the ice — where on the ground a point's mirror image is seen.
const card = (A0, D0, E0 = 0) => ({
  eye: [0, 0, EYE],
  p: ([a, d, h]) => [(a * D0) / d - A0, (D0 * (EYE - h)) / d - (EYE - E0), D0 / d],
});
const mirror = {
  eye: [0, 0, -EYE],
  p: ([a, d, h]) => {
    const t = EYE / (EYE + h);
    return [a * t, d * t, t];
  },
};
const far = (eye, m) => Math.hypot(m[0] - eye[0], m[1] - eye[1], m[2] - eye[2]);
const flat = (m) => Math.hypot(m[0], m[1]);

function poly(g, V, pts) {
  g.beginPath();
  pts.forEach((v, i) => {
    const [x, y] = V.p(v);
    if (i) g.lineTo(x, y);
    else g.moveTo(x, y);
  });
  g.closePath();
}

// a window or a door: the glass glowing as the windows say, frost at its edges, its frame
function hole(g, V, E, h, e, reflected) {
  const d = flat(h.at);
  const fog = fogOf(E, d);
  const [cx, cy, k] = V.p(h.at);
  // a lit window shows through the blizzard better than the wall around it
  const lit = E.win * (1 - 0.5 * fog);
  const veil = (c) => lerp(lerp(c, E.low, 1 - Math.exp(-d / AIR)), E.fog, 0.5 * fog);
  poly(g, V, h.pts);
  if (h.door) {
    g.fillStyle = css(shade(E, WOOD, h.n, d));
    g.fill();
    const seam = [h.pts[0], h.pts[1]].map((v) => V.p(v));
    g.strokeStyle = css(WARM, 0.55 * lit);
    g.lineWidth = 0.05 * k;
    g.beginPath();
    g.moveTo(seam[0][0], seam[0][1]);
    g.lineTo(seam[1][0], seam[1][1]);
    g.stroke();
    return;
  }
  const r = h.w * k;
  const glass = g.createRadialGradient(cx, cy, 0, cx, cy, r * 0.9);
  const pane = lerp(DEEP, E.high, 0.45);
  glass.addColorStop(0, css(veil(lerp(pane, hex('#ffd9a0'), lit))));
  glass.addColorStop(1, css(veil(lerp(pane, WARM_DEEP, lit))));
  g.fillStyle = glass;
  g.fill();
  if (h.frost) {
    const f = g.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 0.75);
    const rime = lerp(hex('#b8cdf0'), hex('#fff3e6'), 0.45 * lit);
    f.addColorStop(0, css(rime, 0));
    f.addColorStop(1, css(rime, 0.55 + 0.25 * lit));
    g.fillStyle = f;
    g.fill();
  }
  // the frame: a cross of thin bars
  const [p0, p1, p2, p3] = h.pts;
  const mid = (u, v) => lerp(u, v, 0.5);
  g.strokeStyle = css(shade(E, WOOD, h.n, d), 0.9);
  g.lineWidth = 0.06 * k;
  g.beginPath();
  for (const [u, v] of [[mid(p0, p3), mid(p1, p2)], [mid(p0, p1), mid(p3, p2)]]) {
    const a = V.p(u);
    const b = V.p(v);
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
  }
  g.stroke();
  if (lit <= 0.01) return;
  if (reflected) {
    const glow = g.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4);
    glow.addColorStop(0, css(WARM, 0.5 * lit));
    glow.addColorStop(1, css(WARM, 0));
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = glow;
    g.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
    g.globalCompositeOperation = 'source-over';
  } else if (e) {
    e.light(cx, cy, r * 1.7, '#ff9a48', 0.55 * lit);
  }
}

// One thing of the village, drawn in a view: its solids face by face (only the faces that look at
// the eye, far ones first), its windows and door on their walls, its lines, its flat shapes.
function drawThing(g, T, V, E, e, reflected = false) {
  const W = inWorld(T);
  const items = [];
  for (const s of W.solids) items.push({ k: far(V.eye, s.centre), s });
  for (const l of W.lines) items.push({ k: far(V.eye, lerp(l.p, l.q, 0.5)) - 0.05, l });
  for (const sh of W.shapes) items.push({ k: far(V.eye, sh.pts[0]), sh });
  items.sort((a, b) => b.k - a.k);
  g.lineJoin = 'round';
  const seen = (f) => dot(f.n, [V.eye[0] - f.mid[0], V.eye[1] - f.mid[1], V.eye[2] - f.mid[2]]) > 0;
  for (const it of items) {
    if (it.s) {
      const shown = it.s.faces.filter(seen);
      for (const f of shown) {
        poly(g, V, f.pts);
        g.fillStyle = faceFill(g, V, E, f);
        g.strokeStyle = g.fillStyle;
        g.lineWidth = e ? e.px : 0.02;
        g.fill();
        g.stroke();
        if (f.side !== undefined && f.part === 0) {
          for (const h of W.holes) if (h.side === f.side) hole(g, V, E, h, e, reflected);
        }
      }
      if (!reflected) rims(g, V, E, shown, seen);
    } else if (it.l) {
      const { p, q, w, mat, snow } = it.l;
      const a = V.p(p);
      const b = V.p(q);
      const n = snow ? [0, 0, 1] : [0, -1, 0];
      g.strokeStyle = css(shade(E, mat, n, flat(lerp(p, q, 0.5))));
      g.lineWidth = w * (a[2] + b[2]) * 0.5;
      g.lineCap = snow ? 'round' : 'butt';
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    } else {
      const { pts, mat, n, alpha = 1 } = it.sh;
      poly(g, V, pts);
      g.fillStyle = css(shade(E, mat, norm(n), flat(pts[0])), alpha);
      g.fill();
    }
  }
}

// a face's colour, a little darker toward its foot and lighter toward its top: walls darken where
// they meet the snow, a roof brightens toward its ridge
function faceFill(g, V, E, f) {
  const c = shade(E, f.mat, f.n, flat(f.mid));
  const lo = f.pts.reduce((p, q) => (q[2] < p[2] ? q : p));
  const hi = f.pts.reduce((p, q) => (q[2] > p[2] ? q : p));
  if (hi[2] - lo[2] < 0.05) return css(c);
  const a = V.p(lo);
  const b = V.p(hi);
  const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
  const stops = f.mat === SNOW ? [[0, 0.86], [1, 1.08]] : [[0, 0.74], [0.35, 1], [1, 1.05]];
  for (const [u, k] of stops) gr.addColorStop(u, css(times(c, k)));
  return gr;
}

// the lit snow just over the edge of what is seen
function rims(g, V, E, shown, seen) {
  g.lineCap = 'round';
  for (const f of shown) {
    for (const { v, w, nb } of f.edges) {
      if (!nb || seen(nb)) continue;
      let lit = 0;
      for (const [L, k] of E.lights) lit += Math.max(0, dot(nb.n, L)) * k;
      if (lit < 0.04) continue;
      const a = V.p(v);
      const b = V.p(w);
      g.strokeStyle = css(shade(E, nb.mat, nb.n, flat(nb.mid)), 0.8 * clamp(lit * 1.3));
      g.lineWidth = 0.04 * (a[2] + b[2]) * 0.5;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    }
  }
}

// Where a thing's card stands: [across, distance, elevation] (scene.json has the same)
const anchor = (T) => [...(T.at || [T.a, T.d]), T.e || 0];

// A thing on its own card (its element's id names it)
function paint(g, e) {
  const T = WORLD[e.id];
  drawThing(g, T, card(...anchor(T)), env(e.state), e);
}

// Чуб's door, a card of its own (to be chosen): it stands where the door is on the wall
const DOOR = (() => {
  const h = inWorld(CHUB).holes.find((x) => x.door);
  const base = lerp(h.pts[0], h.pts[1], 0.5);
  return { a: base[0], d: base[1], h };
})();
function door(g, e) {
  const E = env(e.state);
  hole(g, card(DOOR.a, DOOR.d), E, DOOR.h, e, false);
}

// Smoke from a thing's chimney, on the thing's card: soft puffs rising, leaning with the wind.
const SMOKE = { smoke_chub: 'chub', smoke_solokha: 'solokha', smoke_smithy: 'smithy', smoke_hut1: 'hut1', smoke_hut2: 'hut2' };
function smoke(g, e) {
  const T = WORLD[SMOKE[e.id]];
  const top = inWorld(T).chimney;
  const E = env(e.state);
  const V = card(...anchor(T));
  const [x0, y0, k] = V.p(top);
  const t = e.t;
  const lean = 0.5 + 2.6 * E.storm - 0.4 * E.morning;
  const tint = air(E, add(add(times(E.amb, 1.3), E.moonKey, 0.9), E.sunKey, 0.9), flat(top));
  const n = 14;
  for (let i = 0; i < n; i++) {
    const u = ((i + t * 0.07) / n) % 1;
    const seed = Math.floor((i + t * 0.07) / n) * n + i;
    const rise = u * (5 - 3 * E.storm);
    const sway = anim.drift(t * 0.11 + i * 0.37, 3) * 0.6 * u + anim.noise(seed * 0.7, 5) * 0.3;
    const x = x0 + (lean * u * u * 4 + sway) * k;
    const y = y0 - rise * k;
    const r = (0.25 + 1.1 * u) * k;
    const alpha = 0.3 * Math.min(1, u * 6) * (1 - u) * (1 - 0.5 * E.storm);
    const puff = g.createRadialGradient(x, y, 0, x, y, r);
    puff.addColorStop(0, css(tint, alpha));
    puff.addColorStop(1, css(tint, 0));
    g.fillStyle = puff;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

// ── the ground ──────────────────────────────────────────────────────────
// The street, up to the hill: its middle line (a, d) and half its width there
const STREET = [[0, 0, 4.8], [0.2, 15, 4.6], [1.0, 30, 4.4], [2.4, 50, 4.1], [4.3, 75, 3.8], [6.1, 100, 3.5], [7, 118, 3.2]];
// the road out to the steppe, turning off behind the houses on the right
const ROAD = [[2.6, 52, 2.6], [12, 55, 2.5], [26, 58.5, 2.4], [50, 66, 2.3], [90, 80, 2.2], [160, 104, 2.1], [260, 140, 2]];
// where the street is at distance d: [its middle, half its width]
function streetAt(d) {
  const i = Math.max(1, STREET.findIndex((p) => p[1] >= d));
  const [a0, d0, w0] = STREET[i - 1];
  const [a1, d1, w1] = STREET[Math.min(i, STREET.length - 1)];
  const u = clamp((d - d0) / (d1 - d0 || 1));
  return [mix(a0, a1, u), mix(w0, w1, u)];
}
// the ice: the street glazed from under our feet to where it rounds off, its edges uneven
const ICE = (() => {
  const left = [];
  const right = [];
  for (let d = 2; d <= 28; d += 0.5) {
    const [c, w] = streetAt(d);
    const end = span(d, 20, 28);
    const k = Math.sqrt(1 - end * end);
    left.push([c - (w - 1.3 - 0.4 * (anim.noise(d * 0.4, 41) + 1)) * k, d]);
    right.push([c + (w - 1.3 - 0.4 * (anim.noise(d * 0.4, 42) + 1)) * k, d]);
  }
  return [...left, ...right.reverse()];
})();
function onIce(a, d) {
  let inside = false;
  for (let i = 0, j = ICE.length - 1; i < ICE.length; j = i++) {
    const [ai, di] = ICE[i];
    const [aj, dj] = ICE[j];
    if (di > d !== dj > d && a < ((aj - ai) * (d - di)) / (dj - di) + ai) inside = !inside;
  }
  return inside;
}
const ICE_BOUNDS = [Math.min(...ICE.map((p) => p[0])), Math.max(...ICE.map((p) => p[0])), 2, 28];

// a band along a polyline of [a, d, half-width]: its two edges
function band(line, off = 0) {
  const left = [];
  const right = [];
  line.forEach(([a, d, w], i) => {
    const [pa, pd] = line[Math.max(0, i - 1)];
    const [na, nd] = line[Math.min(line.length - 1, i + 1)];
    const len = Math.hypot(na - pa, nd - pd);
    const nx = (nd - pd) / len;
    const ny = -(na - pa) / len;
    left.push([a - nx * (w + off), d - ny * (w + off)]);
    right.push([a + nx * (w + off), d + ny * (w + off)]);
  });
  return [left, right];
}
const trace = (g, pts) => {
  pts.forEach(([a, d], i) => (i ? g.lineTo(a, d) : g.moveTo(a, d)));
};

// The snow from `near` to `far` metres: rows of the same light as the snow at their distance
// snow d metres off: the farther, the more it shines (light grazing it), and the more air
function snowAt(E, albedo, d) {
  const graze = clamp(1 - EYE / d / 0.3);
  const c = times(shade(E, albedo, [0, 0, 1], d), 0.8 + 0.2 * graze);
  return add(c, E.low, 0.18 * graze * graze);
}
function snowRows(g, E, albedo, near, farD, a0, a1) {
  const n = 18;
  const gr = g.createLinearGradient(0, near, 0, farD);
  for (let i = 0; i <= n; i++) {
    // stops even on screen, not in metres
    const d = EYE / mix(EYE / near, EYE / farD, i / n);
    gr.addColorStop(clamp((d - near) / (farD - near)), css(snowAt(E, albedo, d)));
  }
  g.fillStyle = gr;
  g.fillRect(a0, near, a1 - a0, farD - near);
}

// The ground in bands of distance — planes [across, distance, width, depth]. A plane is drawn after
// whatever stands farther than its far edge: no far edge may fall within a thing's footprint.
// Beyond the last one the sky element paints the steppe down to the horizon.
const STEPPE = 140;
const BANDS = {
  ground_hill: [0, 117.5, 340, 45],
  ground_village: [0, 61.5, 240, 67],
  ground_street: [0, 19, 72, 18],
  ground_near: [0, 5, 28, 10],
  glints: [0, 7.2, 26, 5.5],
};

// Ground of the band of distances [near, far] (a plane's code): in world metres.
function ground(g, e) {
  const [cx, cz, width, depth] = BANDS[e.id];
  const E = env(e.state);
  const near = Math.max(0.5, cz - depth / 2);
  const farD = cz + depth / 2;
  const a0 = cx - width / 2;
  const a1 = cx + width / 2;
  g.save();
  g.transform(1, 0, 0, -1, -cx, cz);
  snowRows(g, E, SNOW, near, farD, a0, a1);

  // the street and the road: packed snow, a shade glossier, edged by the banks
  for (const line of [STREET, ROAD]) {
    const [l, r] = band(line);
    g.beginPath();
    trace(g, l);
    trace(g, [...r].reverse());
    g.closePath();
    g.save();
    g.clip();
    snowRows(g, E, hex('#c9d3e8'), near, farD, a0, a1);
    g.restore();
    for (const [edge, k] of [[l, 1], [r, 1]]) {
      g.beginPath();
      trace(g, edge);
      g.strokeStyle = css(shade(E, SNOW, norm([0, -0.5, 0.8]), 30), 0.35 * k);
      g.lineWidth = 0.22;
      g.stroke();
    }
    // runners' tracks
    for (const off of line === STREET ? [-1.5, -0.8, 1.2, 1.9] : [-0.4, 0.3]) {
      const track = line.map(([a, d], i) => [a + off + 0.15 * Math.sin(d * 0.21 + off * 3), d, i]);
      g.beginPath();
      trace(g, track);
      g.strokeStyle = css(shade(E, hex('#9aa6c4'), [0, 0, 1], 25), 0.3);
      g.lineWidth = 0.07;
      g.stroke();
    }
  }

  // the snow toward the light shines: a soft column under it, widening into the distance
  g.globalCompositeOperation = 'lighter';
  for (const [L, strength, colour] of E.lights) {
    if (strength < 0.02) continue;
    const lx = L[0] / L[1];
    const gr = g.createLinearGradient(0, 3, 0, 80);
    gr.addColorStop(0, css(colour, 0.012 * strength));
    gr.addColorStop(1, css(colour, 0.05 * strength));
    g.fillStyle = gr;
    for (const w of [0.03, 0.07, 0.13, 0.22]) {
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo((lx - w) * farD, farD);
      g.lineTo((lx + w) * farD, farD);
      g.closePath();
      g.fill();
    }
  }
  g.globalCompositeOperation = 'source-over';

  // shadows, away from each light
  for (const [L, strength, , key] of E.lights) {
    if (strength < 0.02 || L[2] < 0.02) continue;
    const sh = (v) => [v[0] - (L[0] / L[2]) * v[2], v[1] - (L[1] / L[2]) * v[2]];
    g.fillStyle = css(shade(E, SNOW, [0, 0, 1], 25, key), 0.88);
    g.strokeStyle = g.fillStyle;
    g.filter = `blur(${(0.05 / e.px).toFixed(1)}px)`;
    for (const T of Object.values(WORLD)) {
      const W = inWorld(T);
      for (const s of W.solids) {
        g.beginPath();
        trace(g, hull([...s.B, ...s.U].map(sh)));
        g.closePath();
        g.fill();
      }
      for (const l of W.lines) {
        if (l.snow) continue;
        const p = sh(l.p);
        const q = sh(l.q);
        g.lineWidth = l.w;
        g.lineCap = 'butt';
        g.beginPath();
        g.moveTo(p[0], p[1]);
        g.lineTo(q[0], q[1]);
        g.stroke();
      }
      for (const s of W.shapes) {
        if ((s.alpha ?? 1) < 1) continue;
        g.beginPath();
        trace(g, hull(s.pts.map(sh)));
        g.closePath();
        g.fill();
      }
    }
    g.filter = 'none';
  }

  // the warm light the windows throw on the snow
  g.globalCompositeOperation = 'lighter';
  for (const T of Object.values(WORLD)) {
    for (const h of inWorld(T).holes) {
      if (h.door) continue;
      const lit = E.win * (1 - fogOf(E, flat(h.at)));
      if (lit < 0.01) continue;
      const x = h.at[0] + h.n[0] * 1.8;
      const y = h.at[1] + h.n[1] * 1.8;
      const glow = g.createRadialGradient(x, y, 0, x, y, 3.2);
      glow.addColorStop(0, css(WARM_DEEP, 0.3 * lit));
      glow.addColorStop(1, css(WARM_DEEP, 0));
      g.fillStyle = glow;
      g.fillRect(x - 3.2, y - 3.2, 6.4, 6.4);
    }
  }
  g.globalCompositeOperation = 'source-over';

  ice(g, e, E, near, farD);
  g.restore();
}

// The ice: the sky mirrored (its gradient, the moon's halo and its long path), and the village
// mirrored in it, soft, as glossy ice shows it.
function ice(g, e, E, near, farD) {
  const [ia0, ia1, id0, id1] = ICE_BOUNDS;
  const d0 = Math.max(near, id0);
  const d1 = Math.min(farD, id1);
  if (d0 >= d1) return;
  g.save();
  g.beginPath();
  trace(g, ICE);
  g.closePath();
  g.clip();
  const [mx, my] = E.moonAt;
  const path = 2 * HORIZON - my; // where the moon's mirror image is on screen
  for (let y = EYE / d0; y > EYE / d1; ) {
    const dA = EYE / y;
    const y2 = y - 0.0015;
    const dB = Math.min(d1, EYE / y2);
    const gr = g.createLinearGradient(ia0, 0, ia1, 0);
    const reflect = 0.5 + 0.4 * clamp(1 - y / 0.35);
    for (let i = 0; i <= 16; i++) {
      const a = mix(ia0, ia1, i / 16);
      const x = STAGE / 2 + a / dA;
      let c = lerp(air(E, DEEP, dA), skyAt(E, x, HORIZON - y), reflect);
      const along = Math.exp(-(((HORIZON + y - path) / 0.42) ** 2));
      const streak = Math.exp(-(((x - mx) / 0.028) ** 2)) * 0.8 + Math.exp(-(((x - mx) / 0.11) ** 2)) * 0.25;
      c = add(c, MOON_DISC, streak * along * E.moonVis);
      gr.addColorStop(i / 16, css(c));
    }
    g.fillStyle = gr;
    g.fillRect(ia0, dA, ia1 - ia0, dB - dA + 0.02);
    y = y2;
  }
  // the village mirrored
  g.globalAlpha = 0.6;
  g.filter = `blur(${(0.09 / e.px).toFixed(1)}px)`;
  const things = Object.values(WORLD).sort((p, q) => Math.hypot(q.a, q.d) - Math.hypot(p.a, p.d));
  for (const T of things) drawThing(g, T, mirror, E, null, true);
  g.filter = 'none';
  g.globalAlpha = 1;
  // a few fine scratches catching the light
  g.strokeStyle = css(add(E.low, E.moonKey, 0.5), 0.12);
  g.lineWidth = 0.015;
  for (let i = 0; i < 26; i++) {
    const a = mix(ia0, ia1, hash(i, 11));
    const d = mix(id0, id1, hash(i, 12));
    const len = 0.4 + 1.6 * hash(i, 13);
    const ang = -0.5 + hash(i, 14);
    g.beginPath();
    g.moveTo(a, d);
    g.lineTo(a + Math.cos(ang) * len, d + Math.sin(ang) * len * 0.5);
    g.stroke();
  }
  g.restore();
}

// convex hull of points [a, d]
function hull(pts) {
  const P = [...pts].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of P) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of [...P].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

// Glints on the near snow (a plane's code): where the light comes from they gather, and flash
// one by one.
function glints(g, e) {
  const [cx, cz, width, depth] = BANDS[e.id];
  const E = env(e.state);
  const [L, strength, colour] = E.lights[0][1] >= E.lights[1][1] ? E.lights[0] : E.lights[1];
  const k = strength * (1 - E.storm);
  if (k < 0.03) return;
  const t = e.t;
  const near = cz - depth / 2;
  const farD = cz + depth / 2;
  const lx = L[0] / L[1];
  g.save();
  g.transform(1, 0, 0, -1, -cx, cz);
  const tint = lerp(colour, [1, 1, 1], 0.6);
  for (let i = 0; i < 900; i++) {
    const d = 1 / mix(1 / near, 1 / farD, hash(i, 1));
    const x = (hash(i, 2) * 2 - 1) * 1.25;
    const a = x * d;
    const toward = Math.exp(-(((x - lx) / 0.2) ** 2));
    if (hash(i, 3) > (0.1 + 0.9 * toward) * (onIce(a, d) ? 0.3 : 1)) continue;
    const flash = Math.max(0, Math.sin(t * (0.5 + 1.3 * hash(i, 4)) + 6.283 * hash(i, 5))) ** 18;
    const alpha = k * (0.3 + 0.7 * flash) * (0.5 + 0.5 * toward);
    if (alpha < 0.03) continue;
    const r = d * 0.0035 * (1 + flash);
    g.fillStyle = css(tint, Math.min(1, alpha));
    g.beginPath();
    g.ellipse(a, d, r, r * 0.6, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

// ── the sky ─────────────────────────────────────────────────────────────
function sky(g, e) {
  const E = env(e.state);
  const x0 = -0.3;
  const x1 = e.aspect + 0.3;
  const gr = g.createLinearGradient(0, -0.35, 0, 1.25);
  const at = (y) => (y + 0.35) / 1.6;
  gr.addColorStop(0, css(E.zen));
  gr.addColorStop(at(0.22), css(E.high));
  gr.addColorStop(at(HORIZON), css(E.low));
  gr.addColorStop(1, css(E.low));
  g.fillStyle = gr;
  g.fillRect(x0, -0.35, x1 - x0, HORIZON + 0.35);
  // the steppe beyond the ground's planes, from the horizon down to where they begin
  const land = g.createLinearGradient(0, HORIZON, 0, HORIZON + EYE / STEPPE);
  for (let i = 0; i <= 8; i++) {
    const y = (i / 8) * (EYE / STEPPE);
    land.addColorStop(i / 8, css(snowAt(E, SNOW, y > 0 ? EYE / y : 1e5)));
  }
  g.fillStyle = land;
  g.fillRect(x0, HORIZON, x1 - x0, 1.25 - HORIZON);
  // the dawn, and the morning sun over the steppe
  g.globalCompositeOperation = 'lighter';
  g.save();
  g.translate(E.sunAt[0], HORIZON);
  g.scale(2.6, 1);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, GLOW_R);
  for (const [u, v] of GLOW_FALL) glow.addColorStop(u, css(E.glow.map((c) => c * v)));
  g.fillStyle = glow;
  g.fillRect(-GLOW_R, -GLOW_R, 2 * GLOW_R, 2 * GLOW_R);
  g.restore();
  g.globalCompositeOperation = 'source-over';
  if (E.sunVis > 0.01) {
    const [sx, sy] = E.sunAt;
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, 0.16);
    sun.addColorStop(0, css([1, 0.97, 0.9], E.sunVis));
    sun.addColorStop(0.2, css([1, 0.95, 0.86], E.sunVis));
    sun.addColorStop(0.24, css([1, 0.86, 0.72], 0.45 * E.sunVis));
    sun.addColorStop(1, css([1, 0.84, 0.7], 0));
    g.fillStyle = sun;
    g.fillRect(sx - 0.16, sy - 0.16, 0.32, 0.32);
  }
}

// stars: many faint, a few bright; the dimmer go first as `stars` falls; the brightest twinkle
function stars(g, e) {
  const E = env(e.state);
  if (E.stars <= 0.001) return;
  const [mx, my] = E.moonAt;
  for (let i = 0; i < 520; i++) {
    const x = -0.3 + (e.aspect + 0.6) * hash(i, 21);
    const y = -0.35 + (HORIZON + 0.33) * hash(i, 22) ** 1.5;
    const b = hash(i, 23) ** 3;
    const keep = clamp((E.stars - (1 - b) * 0.98) * 12 + 1) * clamp(E.stars * 6);
    const near = 1 - 1.4 * E.moonVis * ramp(HALO_FALL, Math.hypot(x - mx, y - my) / HALO_R);
    const low = span(y, HORIZON - 0.02, HORIZON - 0.2);
    const alpha = keep * clamp(near) * low * (0.25 + 0.75 * b);
    if (alpha < 0.02) continue;
    const r = 0.0007 + 0.0018 * b;
    g.fillStyle = css(lerp([0.8, 0.86, 1], [1, 0.95, 0.85], hash(i, 24)), alpha);
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    if (b > 0.55) e.light(x, y, r * 7, '#dfe8ff', 0.5 * alpha);
  }
}

// the moon: its halo, the ashen disc, the bright crescent
function moon(g, e) {
  const E = env(e.state);
  if (E.moonVis <= 0.001) return;
  const [x, y] = E.moonAt;
  const R = 0.095;
  // the ashen disc, then the halo before it (the air the moon lights), then the crescent
  g.fillStyle = css(lerp(lerp(E.high, E.zen, 0.3), MOON_DISC, 0.06), E.moonVis);
  g.beginPath();
  g.arc(x, y, R, 0, Math.PI * 2);
  g.fill();
  const halo = g.createRadialGradient(x, y, 0, x, y, HALO_R);
  for (const [u, v] of HALO_FALL) halo.addColorStop(u, css(HALO, v * E.haloK));
  g.fillStyle = halo;
  g.fillRect(x - HALO_R, y - HALO_R, 2 * HALO_R, 2 * HALO_R);
  // the crescent: the disc less a disc offset toward the upper left
  const phi = Math.atan2(-0.75, -0.66);
  const D = 0.4 * R;
  const r = 0.93 * R;
  const al = Math.acos((R * R + D * D - r * r) / (2 * R * D));
  const be = Math.acos((r * r + D * D - R * R) / (2 * r * D));
  const ox = x + D * Math.cos(phi);
  const oy = y + D * Math.sin(phi);
  g.beginPath();
  g.arc(x, y, R, phi + al, phi + 2 * Math.PI - al, false);
  g.arc(ox, oy, r, phi + Math.PI + be, phi + Math.PI - be, true);
  g.closePath();
  g.fillStyle = css(MOON_DISC, E.moonVis);
  g.fill();
  e.light(x, y, R * 3, '#dfe6ff', 0.35 * E.moonVis);
}

// ── the blizzard ────────────────────────────────────────────────────────
// snow driven across a card: streaks over its half-width w and height top (metres)
const METEL = { blizzard_near: [4.4, 5.4], blizzard_far: [11, 9] };
function blizzard(g, e) {
  const [w, top] = METEL[e.id];
  const E = env(e.state);
  if (E.storm < 0.01) return;
  const t = e.t;
  const flake = lerp(E.fog, [1, 1, 1], 0.35 + 0.25 * E.moon);
  const n = Math.round(700 * E.storm);
  const gust = 1 + 0.35 * anim.drift(t * 0.25, 9);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = hash(i, 31);
    const speed = (6 + 8 * z) * gust;
    const x = ((((hash(i, 32) * 2 * w - speed * t) % (2 * w)) + 2 * w) % (2 * w)) - w;
    const y = ((((hash(i, 33) * top + (1.2 + z) * t) % top) + top) % top) - top + 0.3;
    const len = 0.025 + 0.09 * z * gust;
    g.strokeStyle = css(flake, (0.2 + 0.45 * z) * E.storm);
    g.lineWidth = 0.004 + 0.009 * z;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y - len * 0.3);
    g.stroke();
  }
}

return { paint, door, smoke, ground, glints, sky, stars, moon, blizzard };
