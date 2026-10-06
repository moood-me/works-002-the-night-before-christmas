// Диканька — the village's things, painted as seen from the start in their daylight colours; the
// scene's light (light.looks, lights) makes the night, the dawn, the morning, the blizzard. Each
// thing stands where scene.json puts it: its shape here is in its own metres (x along it, y across,
// z up), turned `rot` degrees, around its anchor.
const { clamp, mix, span, hash } = anim;

// as scene.json has them: the eye, the horizon on screen, the stage
const EYE = 1.7;
const HORIZON = 0.64;
const STAGE = 16 / 9;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const add = (a, b, k = 1) => a.map((v, i) => v + b[i] * k);
const times = (a, k) => a.map((v) => v * k);
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
const norm = (v) => times(v, 1 / Math.hypot(...v));
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const ramp = (stops, u) => {
  if (u <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (u <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], span(u, stops[i - 1][0], stops[i][0]));
  }
  return stops[stops.length - 1][1];
};

// what things are made of, in daylight
const SNOW = hex('#eef2fa');
const LIME = hex('#d8d3c8'); // whitewashed walls
const WOOD = hex('#5a4a3e');
const WATTLE = hex('#6a5a4c');
const WILLOW = hex('#9a9184');
const SHINGLE = hex('#4a4240');
const EAVE = hex('#4a4442');
const POPLAR = hex('#2c3038');
const PACKED = hex('#c9d3e8'); // the street's packed snow
const GLAZE = hex('#7f93b8');
const GLASS = hex('#5f7398');
const WARM = hex('#ffb35c');
const WARM_DEEP = hex('#e8742c');

// A face's colour: lit by the sky above, by the snow around (walls), and by the far light of the
// hour (the moon, the morning sun — the scene's `lights`, as e.lights finds them at the thing), so
// a thing reads as a volume turned to its light; the scene's light (ambient, looks) lays the hour on
// it all.
const form = (albedo, n, key) => times(albedo, 0.5 + 0.2 * Math.max(0, n[2]) + 0.22 * (1 - Math.abs(n[2])) + (key ? 0.3 * key.strength * Math.max(0, dot(n, key.dir)) : 0.1));

// windows: how lit, from the state
const lit = (s) => clamp(s.windows ?? 1) * (1 - 0.85 * clamp(s.morning ?? 0)) * (1 - 0.3 * clamp(s.dawn ?? 0));

// ── shapes ──────────────────────────────────────────────────────────────
// A part is a frustum: its footprint 2hx × 2hy at (x, y), from z0 up to z1 where it is kx, ky as
// wide (a box: 1, 1; a hip roof: a ridge, ky 0; a spire: 0, 0). side: what its sides are made of,
// top / under: its top and its underside, if they are seen. Sides go round from the front (−y).
const part = (o) => ({ x: 0, y: 0, kx: 1, ky: 1, ...o });

// a хата: whitewashed walls, a hip roof of snow; windows on its sides ([side, along 0…1, width])
function khata({ rot, L, W, eave = 2.4, ridge = 6, windows = [], frost, walls = LIME }) {
  const o = 0.45;
  const R = L + 2 * o;
  return {
    rot,
    parts: [
      part({ hx: L / 2, hy: W / 2, z0: 0, z1: eave, side: walls }),
      part({ hx: R / 2, hy: W / 2 + o, z0: eave, z1: ridge, kx: Math.max(0.05, (L - W * 0.85) / R), ky: 0, side: SNOW, under: EAVE }),
    ],
    holes: windows.map(([side, u, w = 0.9], i) => ({ side, u, w, z0: 1, z1: 1.85, frost, name: frost && i === 1 ? 'window' : `window${i + 1}` })),
    lines: [],
    shapes: [],
  };
}

// the church: three log frames in a row, each under tiers of roof and a dome
function tserkva() {
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
  return { rot: 0, parts, holes: [], lines, shapes: [] };
}

// a poplar: a tall dark spindle
function topol(h) {
  const pts = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    pts.push([0.16 * h * Math.sin(Math.PI * u ** 0.75) * 0.5, 0, h * u]);
  }
  return { rot: 0, parts: [], holes: [], lines: [], shapes: [{ pts: [...pts, ...pts.map(([x, y, z]) => [-x, y, z]).reverse()], mat: POPLAR, n: [0, -1, 0] }] };
}

// the well's crane: a post, the long pole across the sky, its rope down to the well
function zhuravel() {
  const post = [4.4, 0.3];
  const pivot = 3.9;
  const dir = norm([-4.4, 0, 6.4]);
  const tip = [post[0] + dir[0] * 7.6, 0, pivot + dir[2] * 7.6];
  const butt = [post[0] - dir[0] * 3.2, 0, pivot - dir[2] * 3.2];
  return {
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
}

// the things, by the ids of their elements (where they stand is scene.json's)
const THINGS = {
  chub: khata({ rot: 52, L: 9.5, W: 6.2, eave: 2.6, ridge: 6.8, windows: [[0, 0.27, 1.0], [0, 0.5, 1.0]], frost: true }),
  solokha: khata({ rot: -38, L: 9, W: 5.6, eave: 2.4, ridge: 6.1, windows: [[0, 0.3], [0, 0.56], [3, 0.5, 0.8]] }),
  smithy: khata({ rot: -12, L: 7.5, W: 5.4, eave: 2.9, ridge: 4.6, walls: WOOD }),
  hut1: khata({ rot: 26, L: 8.5, W: 5.4, windows: [[0, 0.35], [0, 0.62]] }),
  hut2: khata({ rot: -28, L: 8, W: 5.2, windows: [[0, 0.4], [0, 0.66]] }),
  hut3: khata({ rot: 22, L: 8, W: 5.2, windows: [[0, 0.5]] }),
  hut4: khata({ rot: -20, L: 8, W: 5.2, windows: [[0, 0.45], [0, 0.7]] }),
  hut5: khata({ rot: 14, L: 8, W: 5.2, windows: [[0, 0.55]] }),
  hut6: khata({ rot: -16, L: 8, W: 5.2, windows: [[0, 0.4]] }),
  church: tserkva(),
  poplar1: topol(19),
  poplar2: topol(15),
  poplar3: topol(17),
  well: zhuravel(),
};

// ── seeing a thing from the start ───────────────────────────────────────
// Its card stands at its spot (across A0, distance D0, its foot E0 high): a point of the world on
// it, metres from the anchor (y down), and how much a metre there is scaled.
function view(e) {
  const { across: A0, distance: D0, ground, elevation } = e.spot;
  const E0 = ground + elevation;
  return { A0, D0, E0, p: ([a, d, h]) => [(a * D0) / d - A0, (D0 * (EYE - h)) / d - (EYE - E0), D0 / d] };
}

// the faces of a thing in the world, standing at the view's spot
function inWorld(T, V) {
  const r = (T.rot * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const at = ([x, y, z]) => [V.A0 + x * c - y * s, V.D0 + x * s + y * c, V.E0 + z];
  const solids = T.parts.map((p, pi) => {
    const ring = (z, kx, ky) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([u, v]) => at([p.x + u * p.hx * kx, p.y + v * p.hy * ky, z]));
    const B = ring(p.z0, 1, 1);
    const U = ring(p.z1, p.kx, p.ky);
    const centre = at([p.x, p.y, (p.z0 + p.z1) / 2]);
    const faces = [];
    for (let i = 0; i < 4; i++) faces.push({ pts: [B[i], B[(i + 1) % 4], U[(i + 1) % 4], U[i]], mat: p.side, side: i, part: pi });
    if (p.top) faces.push({ pts: U, mat: p.top });
    if (p.under) faces.push({ pts: [...B].reverse(), mat: p.under });
    for (const f of faces) {
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
    // which face is across each edge (a rim: an edge between a face seen and one turned away)
    const key = (v) => v.map((x) => x.toFixed(3)).join(',');
    const across = new Map();
    for (const f of faces) {
      f.edges = [];
      f.pts.forEach((v, j) => {
        const w = f.pts[(j + 1) % f.pts.length];
        if (key(v) === key(w)) return;
        const k = [key(v), key(w)].sort().join('|');
        const edge = { v, w };
        f.edges.push(edge);
        if (across.has(k)) {
          const [other, f2] = across.get(k);
          other.nb = f;
          edge.nb = f2;
        } else across.set(k, [edge, f]);
      });
    }
    return { centre, faces, B };
  });
  const holes = T.holes.map((h) => {
    const A = solids[0].B[h.side];
    const B = solids[0].B[(h.side + 1) % 4];
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const on = (u, z) => [mix(A[0], B[0], u), mix(A[1], B[1], u), A[2] + z];
    const u0 = h.u - h.w / 2 / len;
    const u1 = h.u + h.w / 2 / len;
    return { ...h, pts: [on(u0, h.z0), on(u1, h.z0), on(u1, h.z1), on(u0, h.z1)], at: on(h.u, (h.z0 + h.z1) / 2) };
  });
  return {
    solids,
    holes,
    lines: T.lines.map((l) => ({ ...l, p: at(l.p), q: at(l.q) })),
    shapes: T.shapes.map((sh) => ({ ...sh, pts: sh.pts.map(at) })),
  };
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
const eye = [0, 0, EYE];
const far = (m) => Math.hypot(m[0] - eye[0], m[1] - eye[1], m[2] - eye[2]);
const seen = (f) => dot(f.n, [eye[0] - f.mid[0], eye[1] - f.mid[1], eye[2] - f.mid[2]]) > 0;

// a window: warm glass when lit (its glow a light of the scene, named), frost at its edges
function hole(g, V, e, h, win) {
  const [cx, cy, k] = V.p(h.at);
  poly(g, V, h.pts);
  const r = h.w * k;
  const glass = g.createRadialGradient(cx, cy, 0, cx, cy, r * 0.9);
  glass.addColorStop(0, css(lerp(GLASS, hex('#ffd9a0'), win)));
  glass.addColorStop(1, css(lerp(GLASS, WARM_DEEP, win)));
  g.fillStyle = glass;
  g.fill();
  if (h.frost) {
    const f = g.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 0.75);
    const rime = lerp(hex('#b8cdf0'), hex('#fff3e6'), 0.45 * win);
    f.addColorStop(0, css(rime, 0));
    f.addColorStop(1, css(rime, 0.55 + 0.25 * win));
    g.fillStyle = f;
    g.fill();
  }
  const [p0, p1, p2, p3] = h.pts;
  const mid = (u, v) => lerp(u, v, 0.5);
  g.strokeStyle = css(form(WOOD, [0, -1, 0]), 0.9);
  g.lineWidth = 0.06 * k;
  g.beginPath();
  for (const [u, v] of [[mid(p0, p3), mid(p1, p2)], [mid(p0, p1), mid(p3, p2)]]) {
    const a = V.p(u);
    const b = V.p(v);
    g.moveTo(a[0], a[1]);
    g.lineTo(b[0], b[1]);
  }
  g.stroke();
  e.at(cx, cy, h.name);
  if (win > 0.01) e.light(cx, cy, r * 1.7, '#ff9a48', 0.6 * win, h.name);
}

// The edge of light: where a face turned toward a light behind the thing meets one seen, the snow
// there catches it. The light is the scene's, as it falls on the thing (e.lights).
function rims(g, V, faces, light) {
  if (!light) return;
  g.lineCap = 'round';
  for (const f of faces) {
    for (const { v, w, nb } of f.edges) {
      if (!nb || seen(nb)) continue;
      const k = Math.max(0, dot(nb.n, light.dir)) * light.strength;
      if (k < 0.04) continue;
      const a = V.p(v);
      const b = V.p(w);
      g.strokeStyle = css(lerp(SNOW, light.color, 0.3), clamp(k * 1.1));
      g.lineWidth = 0.04 * (a[2] + b[2]) * 0.5;
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    }
  }
}
// the strongest far light falling on a thing (the moon, the sun low over the steppe), as a
// direction in the world (a, d, h) toward it
function farLight(e, x, y) {
  const l = e.lights(x, y).find((s) => s.distance == null);
  return l ? { dir: norm([l.x, -l.z, -l.y]), strength: l.strength, color: hex(l.color) } : null;
}

// A thing of the village on its card (its element's id names it): its faces that look at the eye,
// far ones first, windows on its walls, lines, flat shapes; the edge of light on its snow.
function paint(g, e) {
  const T = THINGS[e.id];
  const V = view(e);
  const W = inWorld(T, V);
  const win = W.holes.length ? lit(e.state) : 0;
  const items = [];
  for (const s of W.solids) items.push({ k: far(s.centre), s });
  for (const l of W.lines) items.push({ k: far(lerp(l.p, l.q, 0.5)) - 0.05, l });
  for (const sh of W.shapes) items.push({ k: far(sh.pts[0]), sh });
  items.sort((a, b) => b.k - a.k);
  const light = farLight(e, 0, -2);
  g.lineJoin = 'round';
  for (const it of items) {
    if (it.s) {
      const shown = it.s.faces.filter(seen);
      for (const f of shown) {
        poly(g, V, f.pts);
        const c = form(f.mat, f.n, light);
        const lo = f.pts.reduce((p, q) => (q[2] < p[2] ? q : p));
        const hi = f.pts.reduce((p, q) => (q[2] > p[2] ? q : p));
        if (hi[2] - lo[2] < 0.05) g.fillStyle = css(c);
        else {
          // walls darken where they meet the snow, a roof brightens toward its ridge
          const a = V.p(lo);
          const b = V.p(hi);
          const gr = g.createLinearGradient(a[0], a[1], b[0], b[1]);
          const stops = f.mat === SNOW ? [[0, 0.86], [1, 1.08]] : [[0, 0.74], [0.35, 1], [1, 1.05]];
          for (const [u, k] of stops) gr.addColorStop(u, css(times(c, k)));
          g.fillStyle = gr;
        }
        g.strokeStyle = g.fillStyle;
        g.lineWidth = e.px;
        g.fill();
        g.stroke();
        if (f.part === 0) for (const h of W.holes) if (h.side === f.side) hole(g, V, e, h, win);
      }
      rims(g, V, shown, light);
    } else if (it.l) {
      const { p, q, w, mat } = it.l;
      const a = V.p(p);
      const b = V.p(q);
      g.strokeStyle = css(form(mat, [0, -1, 0], light));
      g.lineWidth = w * (a[2] + b[2]) * 0.5;
      g.lineCap = 'butt';
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
    } else {
      poly(g, V, it.sh.pts);
      g.fillStyle = css(form(it.sh.mat, norm(it.sh.n), light));
      g.fill();
    }
  }
  if (e.id === 'church') e.at(0, -4, 'wall');
  if (e.id === 'smithy') e.at(0, -1.2, 'door');
}

// Чуб's door, a card of its own on his wall (it stands where the door is; the wall's turn is his hut's)
function door(g, e) {
  const V = view(e);
  const r = (THINGS.chub.rot * Math.PI) / 180;
  const along = [Math.cos(r), Math.sin(r)];
  const at = (u, z) => [V.A0 + along[0] * u, V.D0 + along[1] * u, V.E0 + z];
  poly(g, V, [at(-0.52, 0), at(0.52, 0), at(0.52, 1.95), at(-0.52, 1.95)]);
  g.fillStyle = css(form(WOOD, [Math.sin(r), -Math.cos(r), 0]));
  g.fill();
  const win = lit(e.state);
  const [a, b] = [V.p(at(-0.5, 0.02)), V.p(at(0.5, 0.02))];
  g.strokeStyle = css(WARM, 0.55 * win);
  g.lineWidth = 0.05 * a[2];
  g.beginPath();
  g.moveTo(a[0], a[1]);
  g.lineTo(b[0], b[1]);
  g.stroke();
  const [cx, cy] = V.p(at(0, 1));
  e.at(cx, cy, 'door');
}

// A chimney on its roof, and its smoke rising, leaning with the wind (the card stands at the
// chimney's foot on the roof)
function chimney(g, e) {
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0);
  const morning = clamp(s.morning ?? 0);
  const tall = e.id === 'chimney_solokha' ? 4.4 : 3;
  g.fillStyle = css(form(LIME, [0, -1, 0]));
  g.fillRect(-0.42, -tall, 0.84, tall);
  g.fillStyle = css(form(SNOW, [0, 0, 1]));
  g.fillRect(-0.48, -tall - 0.12, 0.96, 0.16);
  e.at(0, -tall, 'mouth');
  const t = e.t;
  const lean = 0.5 + 2.6 * storm - 0.4 * morning;
  const tint = hex('#e6ebf4');
  for (let i = 0; i < 14; i++) {
    const u = ((i + t * 0.07) / 14) % 1;
    const seed = Math.floor((i + t * 0.07) / 14) * 14 + i;
    const rise = u * (5 - 3 * storm);
    const sway = anim.drift(t * 0.11 + i * 0.37, 3) * 0.6 * u + anim.noise(seed * 0.7, 5) * 0.3;
    const x = lean * u * u * 4 + sway;
    const y = -tall - rise;
    const r = 0.25 + 1.1 * u;
    const alpha = 0.3 * Math.min(1, u * 6) * (1 - u) * (1 - 0.5 * storm);
    const puff = g.createRadialGradient(x, y, 0, x, y, r);
    puff.addColorStop(0, css(tint, alpha));
    puff.addColorStop(1, css(tint, 0));
    g.fillStyle = puff;
    g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
}

// Чуб's wattle fence: in front of his yard, then along the street — each stretch a part standing at
// its own depth. A woven band, thin stakes over it, snow along its top.
const FENCE = [
  [[-10.6, 0.8], [0, 0]],
  [[0, 0], [0.5, 5.9]],
  [[0.6, 8.2], [1.0, 16.6]],
];
function fence(g, e) {
  const band = css(form(WILLOW, [0, -1, 0]));
  const stake = css(form(WATTLE, [0, -1, 0]));
  const snow = css(form(SNOW, [0, 0, 1]));
  // one stretch of it, painted from its own foot: a piece of the band, a stake, snow along the top
  const stretch = (seed) => (pg) => {
    pg.fillStyle = band;
    pg.fillRect(-0.21, -0.74, 0.42, 0.6);
    pg.strokeStyle = stake;
    pg.lineWidth = 0.032;
    pg.beginPath();
    pg.moveTo(0, 0);
    pg.lineTo(0.02 * (hash(seed, 1) - 0.5), -1.1 - 0.25 * hash(seed, 2));
    pg.stroke();
    pg.strokeStyle = snow;
    pg.lineWidth = 0.07;
    pg.beginPath();
    pg.moveTo(-0.22, -0.77);
    pg.lineTo(0.22, -0.77);
    pg.stroke();
  };
  let n = 0;
  for (const [[x0, z0], [x1, z1]] of FENCE) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const steps = Math.round(len / 0.42);
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const dx = mix(x0, x1, u);
      const dz = mix(z0, z1, u);
      e.part(dx, dz, stretch(n++), [-0.3, -1.4, 0.3, 0.1]);
    }
  }
  // the gate's two posts
  for (const [dx, dz] of [[0.5, 5.9], [0.6, 8.2]]) {
    e.part(dx, dz, (pg) => {
      pg.fillStyle = stake;
      pg.fillRect(-0.06, -1.55, 0.12, 1.55);
    }, [-0.2, -1.7, 0.2, 0.1]);
  }
}

// ── the ground ──────────────────────────────────────────────────────────
// the land: the hill the church stands on, a long soft rise of snow
function hill(across, distance) {
  const u = (across - 7) / 75;
  const v = (distance - 127) / 32;
  const b = (w) => (Math.abs(w) < 1 ? (1 - w * w) ** 2 : 0);
  return 10 * b(u) * b(v);
}

// The street, up to the hill: its middle line (a, d) and half its width there
const STREET = [[0, 0, 4.8], [0.2, 15, 4.6], [1.0, 30, 4.4], [2.4, 50, 4.1], [4.3, 75, 3.8], [6.1, 100, 3.5], [7, 118, 3.2]];
// the road out to the steppe, turning off behind the houses on the right
const ROAD = [[2.6, 52, 2.6], [12, 55, 2.5], [26, 58.5, 2.4], [50, 66, 2.3], [90, 80, 2.2], [160, 104, 2.1], [260, 140, 2]];
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

// a band along a polyline of [a, d, half-width]: its two edges
function edges(line) {
  const left = [];
  const right = [];
  line.forEach(([a, d, w], i) => {
    const [pa, pd] = line[Math.max(0, i - 1)];
    const [na, nd] = line[Math.min(line.length - 1, i + 1)];
    const len = Math.hypot(na - pa, nd - pd);
    const nx = (nd - pd) / len;
    const ny = -(na - pa) / len;
    left.push([a - nx * w, d - ny * w]);
    right.push([a + nx * w, d + ny * w]);
  });
  return [left, right];
}
const trace = (g, pts) => pts.forEach(([a, d], i) => (i ? g.lineTo(a, d) : g.moveTo(a, d)));
// a plane's code in the world's metres (a, d): from its own centre, y toward the viewer
const PLANES = { street: [3, 59, 18, 122], road: [130, 96, 270, 92], ice: [0, 15, 10, 27] };
function onPlane(g, id) {
  const [cx, cz] = PLANES[id];
  g.transform(1, 0, 0, -1, -cx, cz);
}

// the snow: all one
function snow(g) {
  g.fillStyle = css(SNOW);
  g.fillRect(-1e5, -1e5, 2e5, 2e5);
}
// the street and the road: packed snow edged by its banks, runners' tracks along it
function way(g, e) {
  const line = e.id === 'street' ? STREET : ROAD;
  onPlane(g, e.id);
  const [l, r] = edges(line);
  g.beginPath();
  trace(g, l);
  trace(g, [...r].reverse());
  g.closePath();
  g.fillStyle = css(PACKED);
  g.fill();
  g.strokeStyle = css(times(SNOW, 1.02), 0.6);
  g.lineWidth = 0.22;
  for (const edge of [l, r]) {
    g.beginPath();
    trace(g, edge);
    g.stroke();
  }
  g.strokeStyle = css(hex('#9aa6c4'), 0.35);
  g.lineWidth = 0.07;
  for (const off of line === STREET ? [-1.5, -0.8, 1.2, 1.9] : [-0.4, 0.3]) {
    g.beginPath();
    trace(g, line.map(([a, d]) => [a + off + 0.15 * Math.sin(d * 0.21 + off * 3), d]));
    g.stroke();
  }
}
// the ice: dark and glossy — a mirror of all over it (its `reflect`); a few fine scratches
function ice(g) {
  onPlane(g, 'ice');
  g.beginPath();
  trace(g, ICE);
  g.closePath();
  g.fillStyle = css(GLAZE);
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = css(SNOW, 0.12);
  g.lineWidth = 0.015;
  for (let i = 0; i < 26; i++) {
    const a = mix(-3.5, 4, hash(i, 11));
    const d = mix(3, 27, hash(i, 12));
    const len = 0.4 + 1.6 * hash(i, 13);
    const ang = -0.5 + hash(i, 14);
    g.beginPath();
    g.moveTo(a, d);
    g.lineTo(a + Math.cos(ang) * len, d + Math.sin(ang) * len * 0.5);
    g.stroke();
  }
  g.restore();
}
// Glints on the near snow: they gather toward the light that is up (the moon, the morning sun) and
// flash one by one — painted unlit (glows), so the night doesn't put them out
function glints(g, e) {
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0);
  const moon = clamp(s.moon ?? 1) * (1 - 0.7 * clamp(s.dawn ?? 0));
  const morning = clamp(s.morning ?? 0);
  const k = Math.max(moon * (1 - morning), morning) * (1 - storm);
  if (k < 0.03) return;
  const lx = morning > 0.5 ? 0.62 : ((s.moon_x ?? 0.4) - 0.5) * STAGE;
  const tint = morning > 0.5 ? hex('#fff1dc') : hex('#e4ecff');
  const t = e.t;
  g.transform(1, 0, 0, -1, 0, 7.2);
  for (let i = 0; i < 900; i++) {
    const d = 1 / mix(1 / 4.45, 1 / 9.95, hash(i, 1));
    const x = (hash(i, 2) * 2 - 1) * 1.25;
    const a = x * d;
    const toward = Math.exp(-(((x - lx) / 0.2) ** 2));
    if (hash(i, 3) > 0.1 + 0.9 * toward) continue;
    const flash = Math.max(0, Math.sin(t * (0.5 + 1.3 * hash(i, 4)) + 6.283 * hash(i, 5))) ** 18;
    const alpha = k * (0.3 + 0.7 * flash) * (0.5 + 0.5 * toward) * 0.8;
    if (alpha < 0.03) continue;
    const r = d * 0.0035 * (1 + flash);
    g.fillStyle = css(tint, Math.min(1, alpha));
    g.beginPath();
    g.ellipse(a, d, r, r * 0.6, 0, 0, Math.PI * 2);
    g.fill();
  }
}

// ── the sky (not lit: it paints its own hour) ───────────────────────────
const MOODS = {
  night: { zen: '#050d2a', high: '#0f2257', low: '#33508c' },
  dark: { zen: '#010207', high: '#02040c', low: '#080d1b' },
  dawn: { zen: '#18245a', high: '#5a5a96', low: '#f3a58e' },
  morning: { zen: '#4a7fcb', high: '#9bbfe8', low: '#f8dcc8' },
};
const MOON_DISC = hex('#f4f2ea');
const HALO = hex('#9db4ec');
const GLOW_DAWN = hex('#ff9d7c');
const GLOW_DAY = hex('#fff1da');
const FOG = hex('#2a3450');
const SUN = { x: 0.84, y: 0.5 };
const HALO_R = 0.95;
const HALO_FALL = [[0, 0.36], [0.1, 0.26], [0.2, 0.15], [0.36, 0.07], [0.6, 0.02], [1, 0]];
const GLOW_R = 0.75;
const GLOW_FALL = [[0, 1], [0.15, 0.6], [0.4, 0.22], [0.75, 0.05], [1, 0]];
// the crescent: the moon's disc (radius MOON_R) less a disc offset toward MOON_TURN (the upper left)
const MOON_R = 0.095;
const MOON_TURN = Math.atan2(-0.75, -0.66);

function skyOf(s) {
  const moon = clamp(s.moon ?? 1);
  const dawn = clamp(s.dawn ?? 0);
  const morning = clamp(s.morning ?? 0);
  const storm = clamp(s.blizzard ?? 0);
  const pick = (k) => lerp(lerp(lerp(hex(MOODS.dark[k]), hex(MOODS.night[k]), moon), hex(MOODS.dawn[k]), dawn * (1 - morning)), hex(MOODS.morning[k]), morning);
  const fog = lerp(times(FOG, 0.4 + 0.6 * moon), hex('#dfe6f0'), morning);
  const S = { moon, dawn, morning, storm };
  S.zen = lerp(pick('zen'), fog, storm * 0.85);
  S.high = lerp(pick('high'), fog, storm * 0.9);
  S.low = lerp(pick('low'), fog, storm * 0.9);
  const mx = s.moon_x ?? 0.4;
  const my = s.moon_y ?? 0.2;
  S.moonAt = [mx * STAGE, my];
  // dawn and morning pale it to a faint crescent; its glow is the night's
  S.moonVis = moon * (1 - 0.7 * dawn) * (1 - 0.9 * morning) * (1 - 0.75 * storm);
  S.haloAt = [S.moonAt[0] - 0.55 * MOON_R * Math.cos(MOON_TURN), my - 0.55 * MOON_R * Math.sin(MOON_TURN)];
  S.haloK = S.moonVis * (1 - dawn) * (1 - morning);
  S.sunAt = [SUN.x * STAGE, SUN.y];
  S.sunVis = morning * (1 - 0.8 * storm);
  S.glow = times(lerp(GLOW_DAWN, GLOW_DAY, morning), Math.max(dawn * 0.75, morning * 0.6) * (1 - 0.7 * storm));
  S.stars = clamp(s.stars ?? 1) * (1 - dawn) * (1 - morning) * (1 - storm);
  return S;
}

function sky(g, e) {
  const S = skyOf(e.state);
  const x0 = -0.3;
  const x1 = e.aspect + 0.3;
  const gr = g.createLinearGradient(0, -0.35, 0, 1.25);
  const at = (y) => (y + 0.35) / 1.6;
  gr.addColorStop(0, css(S.zen));
  gr.addColorStop(at(0.22), css(S.high));
  gr.addColorStop(at(HORIZON), css(S.low));
  gr.addColorStop(1, css(S.low));
  g.fillStyle = gr;
  g.fillRect(x0, -0.35, x1 - x0, 1.6);
  // the dawn, and the morning sun over the steppe
  g.globalCompositeOperation = 'lighter';
  g.save();
  g.translate(S.sunAt[0], HORIZON);
  g.scale(2.6, 1);
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, GLOW_R);
  for (const [u, v] of GLOW_FALL) glow.addColorStop(u, css(S.glow.map((c) => c * v)));
  g.fillStyle = glow;
  g.fillRect(-GLOW_R, -GLOW_R, 2 * GLOW_R, 2 * GLOW_R);
  g.restore();
  g.globalCompositeOperation = 'source-over';
  if (S.sunVis > 0.01) {
    const [sx, sy] = S.sunAt;
    const sun = g.createRadialGradient(sx, sy, 0, sx, sy, 0.16);
    sun.addColorStop(0, css([1, 0.97, 0.9], S.sunVis));
    sun.addColorStop(0.2, css([1, 0.95, 0.86], S.sunVis));
    sun.addColorStop(0.24, css([1, 0.86, 0.72], 0.45 * S.sunVis));
    sun.addColorStop(1, css([1, 0.84, 0.7], 0));
    g.fillStyle = sun;
    g.fillRect(sx - 0.16, sy - 0.16, 0.32, 0.32);
  }
}

// stars: many faint, a few bright; the dimmer go first as `stars` falls; the brightest twinkle
function stars(g, e) {
  const S = skyOf(e.state);
  if (S.stars <= 0.001) return;
  const [mx, my] = S.haloAt;
  for (let i = 0; i < 520; i++) {
    const x = -0.3 + (e.aspect + 0.6) * hash(i, 21);
    const y = -0.35 + (HORIZON + 0.33) * hash(i, 22) ** 1.5;
    const b = hash(i, 23) ** 3;
    const keep = clamp((S.stars - (1 - b) * 0.98) * 12 + 1) * clamp(S.stars * 6);
    const near = 1 - 2.4 * S.haloK * ramp(HALO_FALL, Math.hypot(x - mx, y - my) / HALO_R);
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

// the moon: the air it lights, then the crescent glowing softly at its edge
function moon(g, e) {
  const S = skyOf(e.state);
  if (S.moonVis <= 0.001) return;
  const [hx, hy] = S.haloAt;
  const halo = g.createRadialGradient(hx, hy, 0, hx, hy, HALO_R);
  for (const [u, v] of HALO_FALL) halo.addColorStop(u, css(HALO, v * S.haloK));
  g.fillStyle = halo;
  g.fillRect(hx - HALO_R, hy - HALO_R, 2 * HALO_R, 2 * HALO_R);
  const [x, y] = S.moonAt;
  const R = MOON_R;
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
  g.shadowColor = css(hex('#c9d6ff'), 0.8 * S.haloK);
  g.shadowBlur = (0.035 * S.haloK) / e.px;
  g.fillStyle = css(MOON_DISC, S.moonVis);
  g.fill();
  g.shadowBlur = 0;
  e.at(x, y, 'moon');
}

// ── the blizzard ────────────────────────────────────────────────────────
// snow driven across a card: streaks over its half-width w and height top (metres), painted unlit
const METEL = { blizzard_near: [4.4, 5.4], blizzard_far: [11, 9] };
function blizzard(g, e) {
  const [w, top] = METEL[e.id];
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0);
  if (storm < 0.01) return;
  const t = e.t;
  const flake = lerp(times(FOG, 0.5 + 0.8 * clamp(s.moon ?? 1)), [1, 1, 1], 0.35);
  const n = Math.round(700 * storm);
  const gust = 1 + 0.35 * anim.drift(t * 0.25, 9);
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = hash(i, 31);
    const speed = (6 + 8 * z) * gust;
    const x = ((((hash(i, 32) * 2 * w - speed * t) % (2 * w)) + 2 * w) % (2 * w)) - w;
    const y = ((((hash(i, 33) * top + (1.2 + z) * t) % top) + top) % top) - top + 0.3;
    const len = 0.025 + 0.09 * z * gust;
    g.strokeStyle = css(flake, (0.2 + 0.45 * z) * storm);
    g.lineWidth = 0.004 + 0.009 * z;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y - len * 0.3);
    g.stroke();
  }
}

return { hill, paint, door, chimney, fence, snow, way, ice, glints, sky, stars, moon, blizzard };
