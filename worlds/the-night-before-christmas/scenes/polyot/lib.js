// Полёт — the way from the field behind Пацюк's fence to the palace, laid out on the ground where
// it is; the camera flies along it (the script: camera_z from `progress`, camera_h, camera_x).
//
// World: metres; a — to the right of the line of flight, d — ahead of the start.
const { clamp, mix, span, hash } = anim;

// as scene.json has it: the horizon on screen
const HORIZON = 0.5;

// how far the flight goes: progress 1 is camera_z = ROUTE
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
const NEEDLES = hex('#1d2a2a');
const HAY = hex('#9a8a70');
const WILLOW = hex('#7c776f');
const STUCCO = hex('#c9cdb8');
const STONE = hex('#8f8c88');
const DEEP = hex('#0b1530');

// the moon: far — a crescent high to the right; near (moon_near 1) — huge, beside the flyers.
// x, y — where on the stage (fractions of its width, of its height), r — its radius (heights).
// Its crescent is its disc less a disc offset toward MOON_TURN.
const MOON_FAR = { x: 0.67, y: 0.26, r: 0.075 };
const MOON_NEAR = { x: 0.78, y: 0.14, r: 0.27 };
const MOON_TURN = Math.atan2(-0.75, -0.66);
const HALO_FALL = [[0, 0.36], [0.1, 0.26], [0.2, 0.15], [0.36, 0.07], [0.6, 0.02], [1, 0]];
const GLOW_FALL = [[0, 1], [0.15, 0.6], [0.4, 0.22], [0.75, 0.05], [1, 0]];
const GLOW_X = 0.8; // where on the horizon the dawn comes up
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
  E.m = { x: mix(MOON_FAR.x, MOON_NEAR.x, near), y: mix(MOON_FAR.y, MOON_NEAR.y, near), r: mix(MOON_FAR.r, MOON_NEAR.r, near) };
  E.moonL = norm([(E.m.x - 0.5) * (16 / 9), 1, HORIZON - E.m.y]);
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

// a surface of `albedo` facing n (world, unit) in the light of the moment
function shade(E, albedo, n) {
  const up = n[2];
  let c = times(E.amb, 0.55 + 0.45 * up);
  c = add(c, E.bounce, 0.3 * (1 - up));
  c = add(c, E.moonKey, Math.max(0, dot(n, E.moonL)));
  return mul(albedo, c);
}
const FRONT = [0, -1, 0];
const SLOPE = norm([0, -0.6, 0.8]);
const UP = [0, 0, 1];

// ── things of the way: each a card standing where it is, painted as it is ──
// (in metres from its anchor, y up negative; seen from the front)
function quad(g, pts, colour) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = colour;
  g.fill();
}
function windowAt(g, e, E, x, y, w, h) {
  g.fillStyle = css(lerp(DEEP, WARM, E.win));
  g.fillRect(x - w / 2, y - h, w, h);
  if (E.win > 0.01) e.light(x, y - h / 2, Math.max(w * 2.2, 2 * e.px), '#ff9a48', 0.7 * E.win);
}

const PAINT = {
  // a хата: a whitewashed wall, a roof of snow, a chimney, windows
  hut(g, e, E, { w = 8.5, windows = 2 }) {
    const h = 2.4;
    quad(g, [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]], css(shade(E, LIME, FRONT)));
    quad(g, [[w / 2 + 0.5, -h], [-w / 2 - 0.5, -h], [-w / 2 + 2, -h - 3.4], [w / 2 - 2, -h - 3.4]], css(shade(E, SNOW, SLOPE)));
    quad(g, [[w / 4, -h - 2.4], [w / 4 + 0.8, -h - 2.4], [w / 4 + 0.8, -h - 4.4], [w / 4, -h - 4.4]], css(shade(E, LIME, FRONT)));
    for (let i = 0; i < windows; i++) windowAt(g, e, E, -w / 2 + (w * (i + 1)) / (windows + 1), -1, 0.9, 0.8);
  },
  // a wooden church: a log frame, a roof tier, a dome, a cross
  church(g, e, E, { s = 1.2 }) {
    const wood = css(shade(E, WOOD, FRONT));
    quad(g, [[-3.5 * s, 0], [3.5 * s, 0], [3.5 * s, -8 * s], [-3.5 * s, -8 * s]], wood);
    quad(g, [[4 * s, -8 * s], [-4 * s, -8 * s], [-2 * s, -10.5 * s], [2 * s, -10.5 * s]], css(shade(E, SNOW, SLOPE)));
    quad(g, [[-2 * s, -10.5 * s], [2 * s, -10.5 * s], [2 * s, -12 * s], [-2 * s, -12 * s]], wood);
    quad(g, [[2.3 * s, -12 * s], [-2.3 * s, -12 * s], [0, -16 * s]], css(shade(E, SHINGLE, SLOPE)));
    g.strokeStyle = css(shade(E, SHINGLE, FRONT));
    g.lineWidth = 0.15 * s;
    g.beginPath();
    g.moveTo(0, -16 * s);
    g.lineTo(0, -18.5 * s);
    g.moveTo(-0.7 * s, -17.6 * s);
    g.lineTo(0.7 * s, -17.6 * s);
    g.stroke();
  },
  // firs in a row: dark tiers of needles under snow
  firs(g, e, E, { n = 6, w = 40, seed = 1 }) {
    const dark = css(shade(E, NEEDLES, FRONT));
    const snow = css(shade(E, SNOW, SLOPE));
    for (let i = 0; i < n; i++) {
      const x = (hash(i, seed) - 0.5) * w;
      const h = 10 + 9 * hash(i, seed + 1);
      quad(g, [[x - 0.24 * h, 0], [x + 0.24 * h, 0], [x, -h]], dark);
      quad(g, [[x - 0.12 * h, -0.55 * h], [x + 0.12 * h, -0.55 * h], [x, -h]], snow);
    }
  },
  // a стог: a dome of hay under a cap of snow
  stog(g, e, E, { s = 1 }) {
    g.fillStyle = css(shade(E, HAY, FRONT));
    g.beginPath();
    g.ellipse(0, 0, 2.3 * s, 3.4 * s, 0, Math.PI, 0);
    g.fill();
    g.fillStyle = css(shade(E, SNOW, SLOPE));
    g.beginPath();
    g.ellipse(0, -1.6 * s, 1.7 * s, 1.8 * s, 0, Math.PI, 0);
    g.fill();
  },
  // a wattle fence across the field: a woven band, stakes over it, snow along its top
  fence(g, e, E, { w = 14 }) {
    quad(g, [[-w / 2, -0.15], [w / 2, -0.15], [w / 2, -0.8], [-w / 2, -0.8]], css(shade(E, WILLOW, FRONT)));
    g.strokeStyle = css(shade(E, WOOD, FRONT));
    g.lineWidth = 0.04;
    g.beginPath();
    for (let x = -w / 2; x <= w / 2; x += 0.45) {
      g.moveTo(x, 0);
      g.lineTo(x, -1.1 - 0.25 * hash(Math.round(x * 10), 6));
    }
    g.stroke();
    g.strokeStyle = css(shade(E, SNOW, UP));
    g.lineWidth = 0.07;
    g.beginPath();
    g.moveTo(-w / 2, -0.83);
    g.lineTo(w / 2, -0.83);
    g.stroke();
  },
  // a windmill: a timber body and four thin sails
  windmill(g, e, E) {
    quad(g, [[-3, 0], [3, 0], [2.6, -9], [-2.6, -9]], css(shade(E, WOOD, FRONT)));
    quad(g, [[3.3, -9], [-3.3, -9], [0, -12]], css(shade(E, SNOW, SLOPE)));
    g.strokeStyle = css(shade(E, WOOD, FRONT));
    g.lineWidth = 0.45;
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      g.moveTo(0, -9);
      g.lineTo(9 * Math.cos(k * 1.571 + 0.4), -9 - 9 * Math.sin(k * 1.571 + 0.4));
    }
    g.stroke();
  },
  // a stone house of the city: rows of lit windows, a snow roof
  block(g, e, E, { w = 30, seed = 1 }) {
    const h = 14;
    quad(g, [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]], css(shade(E, STONE, FRONT)));
    quad(g, [[w / 2 + 0.5, -h], [-w / 2 - 0.5, -h], [-w / 2 + 1, -h - 2.5], [w / 2 - 1, -h - 2.5]], css(shade(E, SNOW, SLOPE)));
    const cols = Math.round(w / 4);
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < cols; k++) if (hash(k * 7 + row, seed) > 0.3) windowAt(g, e, E, -w / 2 + (w * (k + 0.5)) / cols, -2.5 - row * 4, 1.6, 2.5);
    }
  },
  // the palace: a long pale front of lit windows, a snow roof, cupolas
  palace(g, e, E) {
    const w = 180;
    const h = 21;
    quad(g, [[-w / 2, 0], [w / 2, 0], [w / 2, -h], [-w / 2, -h]], css(shade(E, STUCCO, FRONT)));
    quad(g, [[w / 2 + 1, -h], [-w / 2 - 1, -h], [-w / 2 + 3, -h - 5], [w / 2 - 3, -h - 5]], css(shade(E, SNOW, SLOPE)));
    for (const x of [-w / 2 + 12, 0, w / 2 - 12]) {
      quad(g, [[x - 6, -h - 2], [x + 6, -h - 2], [x + 6, -h - 8], [x - 6, -h - 8]], css(shade(E, STUCCO, FRONT)));
      quad(g, [[x - 6.5, -h - 8], [x + 6.5, -h - 8], [x, -h - 16]], css(shade(E, SHINGLE, SLOPE)));
    }
    for (let row = 0; row < 3; row++) {
      for (let k = 0; k < 30; k++) windowAt(g, e, E, -w / 2 + (w * (k + 0.5)) / 30, -3 - row * 6.5, 2.2, 4);
    }
  },
  // a cloud: a few long soft layers, lit along their tops
  cloud(g, e, E, { w = 200, seed = 1 }) {
    const lit = add(times(E.amb, 1.1), E.moonKey, 0.75);
    const dark = times(E.amb, 0.7);
    for (let i = 0; i < 6; i++) {
      const x = (hash(i, seed) - 0.5) * w * 0.5;
      const y = (hash(i, seed + 1) - 0.5) * w * 0.06;
      const r = w * (0.25 + 0.2 * hash(i, seed + 2));
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
  },
};

// The things of the way, where they stand: id → [kind, across, distance, options, elevation]
const THINGS = {};
const put = (id, kind, a, d, o = {}, h = 0) => (THINGS[id] = [kind, a, d, o, h]);
// the field behind Пацюк's fence, and Диканька ahead
put('fence', 'fence', -7, 18, { w: 10 });
put('stog1', 'stog', 14, 60, { s: 0.9 });
put('stog2', 'stog', 22, 74, { s: 0.75 });
[[-60, 410], [-30, 430], [5, 420], [35, 445], [-80, 470], [20, 490], [-45, 510], [60, 520]].forEach(([a, d], i) => put(`dikanka${i + 1}`, 'hut', a, d, { windows: 1 + (i % 2) }));
put('dikanka_church', 'church', -10, 540, { s: 1.5 });
// the steppe: стоги, firs, a windmill, хутори
[[55, 1400], [69, 1420], [46, 1434], [-150, 1700], [90, 2500]].forEach(([a, d], i) => put(`steppe_stog${i + 1}`, 'stog', a, d, { s: 1.1 }));
put('windmill', 'windmill', -90, 1900);
[[160, 1250], [-220, 2050], [190, 5050]].forEach(([a, d], i) => {
  put(`khutir${i + 1}`, 'hut', a, d, { windows: 2 });
  put(`khutir${i + 1}_firs`, 'firs', a + 8, d + 8, { n: 2, w: 12, seed: 70 + i });
});
// the forest
for (let i = 0; i < 9; i++) put(`forest${i + 1}`, 'firs', -150 + 40 * (i % 5) + 30 * hash(i, 81), 2300 + 110 * i, { n: 12, w: 160, seed: 80 + i });
// the villages
[[-110, 3650, 4], [60, 4250, 5], [-70, 4850, 4]].forEach(([a, d, n], v) => {
  for (let i = 0; i < n; i++) put(`village${v + 1}_${i + 1}`, 'hut', a + (i % 2 ? 22 : -22) + 10 * hash(i, v), d + 30 * i, { windows: 1 + (i % 2) });
  if (v < 2) put(`village${v + 1}_church`, 'church', a, d + 15 * n, { s: 1.2 });
});
// Petersburg: stone houses, the palace by the river
for (let i = 0; i < 12; i++) put(`city${i + 1}`, 'block', -200 + 36 * (i % 6) + 20 * hash(i, 91), 5450 + 95 * i, { w: 24 + 16 * hash(i, 92), seed: 90 + i });
put('palace', 'palace', 40, 6420);
// clouds, at their heights
[[-140, 600, 170, 260], [170, 1000, 70, 200], [-60, 1600, 60, 240], [110, 2200, 175, 300], [-210, 2850, 75, 260], [40, 3500, 65, 220], [-100, 4300, 170, 320], [150, 5100, 80, 260]].forEach(([a, d, h, w], i) => put(`cloud${i + 1}`, 'cloud', a, d, { w, seed: i + 1 }, h));

function thing(g, e) {
  const [kind, , , o] = THINGS[e.id];
  PAINT[kind](g, e, env(e.state), o);
}

// ── the ground ──────────────────────────────────────────────────────────
// the frozen river the flight follows: its middle (across) and width at distance d
const riverAt = (d) => [150 + 70 * Math.sin(d / 650) + 35 * Math.sin(d / 230 + 1), 45 + 70 * span(d, 5500, 6300)];
// the sled road from Диканька north, along the river's left
const roadAt = (d) => -20 + 40 * Math.sin(d / 900) + 0.02 * d;
// Planes: [across, distance, width, depth]; scene.json has the same. A plane's painting is one
// texture of 2048 px, so the way is laid in pieces a kilometre long, fine enough for the river's
// banks; beside and beyond them the snow is all one.
const PIECE = 1000;
const PIECES = 9;
const PLANES = { ground_far: [0, 204250, 1000000, 391500], ground_left: [-10400, 4250, 19200, 9000], ground_right: [10400, 4250, 19200, 9000] };
for (let i = 0; i < PIECES; i++) {
  const d = -250 + PIECE * (i + 0.5);
  PLANES[`ground${i + 1}`] = [0, d, 1600, PIECE];
  PLANES[`river${i + 1}`] = [200, d, 600, PIECE];
}
// a band along the way (the river), from d0 to d1: its middle f(d), its half-width w(d)
function band(g, f, w, d0, d1) {
  for (let d = d0; d <= d1; d += 10) {
    if (d === d0) g.moveTo(f(d) - w(d), -d);
    else g.lineTo(f(d) - w(d), -d);
  }
  for (let d = d1; d >= d0; d -= 10) g.lineTo(f(d) + w(d), -d);
  g.closePath();
}
const mid = (d) => riverAt(d)[0];
const half = (d) => riverAt(d)[1] / 2;
// a plane's code: in world metres (a, −d), from its own centre
function onPlane(g, id) {
  const [cx, cz, , depth] = PLANES[id];
  g.translate(-cx, cz);
  return [cz - depth / 2 - 20, cz + depth / 2 + 20];
}

// the snow: all one; on the way the river's bed is left open (its ice is a plane of its own) and the
// sled road runs along it
function ground(g, e) {
  const E = env(e.state);
  g.fillStyle = css(shade(E, SNOW, UP));
  if (!/^ground\d/.test(e.id)) {
    g.fillRect(-1e6, -1e6, 2e6, 2e6);
    return;
  }
  const [d0, d1] = onPlane(g, e.id);
  g.beginPath();
  g.rect(-1e4, -d1, 2e4, d1 - d0);
  band(g, mid, half, d0, d1);
  g.fill('evenodd');
  g.strokeStyle = css(shade(E, hex('#b7c0d6'), UP));
  g.lineWidth = 5;
  g.beginPath();
  for (let d = Math.max(600, d0); d <= d1; d += 10) {
    if (d === Math.max(600, d0)) g.moveTo(roadAt(d), -d);
    else g.lineTo(roadAt(d), -d);
  }
  g.stroke();
}
// the river: ice, darker than the snow and a little clear — the sky's reflection shows through
function river(g, e) {
  const E = env(e.state);
  const [d0, d1] = onPlane(g, e.id);
  g.beginPath();
  band(g, mid, half, d0, d1);
  g.fillStyle = css(lerp(DEEP, E.high, 0.25), 0.6);
  g.fill();
  g.strokeStyle = css(shade(E, SNOW, norm([0, -0.4, 0.9])));
  g.lineWidth = 4;
  g.stroke();
}

// ── the sky ─────────────────────────────────────────────────────────────
// the sky above the horizon (below it the land, and the sky mirrored where the ice lets it show)
function sky(g, e) {
  const E = env(e.state);
  const x0 = -0.3;
  const x1 = e.aspect + 0.3;
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
    g.translate(GLOW_X * e.aspect, HORIZON);
    g.scale(2.6, 1);
    const glow = g.createRadialGradient(0, 0, 0, 0, 0, 0.75);
    for (const [u, v] of GLOW_FALL) glow.addColorStop(u, css(E.glow, v));
    g.fillStyle = glow;
    g.fillRect(-0.75, -0.75, 1.5, 1.5);
    g.restore();
  }
}

// stars: the dimmer go first as `stars` falls; at dawn they go out one by one
function stars(g, e) {
  const E = env(e.state);
  const left = E.stars * (1 - E.dawn);
  if (left <= 0.001) return;
  const mx = E.m.x * e.aspect;
  const my = E.m.y;
  for (let i = 0; i < 600; i++) {
    const x = -0.3 + (e.aspect + 0.6) * hash(i, 21);
    const y = -0.35 + (HORIZON + 0.33) * hash(i, 22) ** 1.5;
    const b = hash(i, 23) ** 3;
    const keep = clamp((left - (1 - b) * 0.98) * 40 + 1);
    const nearMoon = 1 - 2.4 * E.haloK * ramp(HALO_FALL, Math.hypot(x - mx, y - my) / (E.m.r * 10));
    const low = span(y, HORIZON - 0.02, HORIZON - 0.15);
    const alpha = keep * clamp(nearMoon) * low * (0.25 + 0.75 * b);
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
  const E = env(e.state);
  if (E.moonVis <= 0.001) return;
  const x = E.m.x * e.aspect;
  const y = E.m.y;
  const R = E.m.r;
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

return { ROUTE, thing, ground, river, sky, stars, moon };
