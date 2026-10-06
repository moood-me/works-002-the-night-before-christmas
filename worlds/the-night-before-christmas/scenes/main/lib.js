// Диканька — the village's things, painted in their daylight colours; the scene's light (light.looks,
// lights) makes the night, the dawn, the morning, the blizzard. Each face of a thing stands where
// scene.json puts it and is painted flat in its own metres.
const { clamp, mix, span, hash } = anim;

// as scene.json has them: the horizon on screen, the stage
const HORIZON = 0.64;
const STAGE = 16 / 9;

// ── colour ──────────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lerp = (a, b, u) => a.map((v, i) => mix(v, b[i], u));
const times = (a, k) => a.map((v) => v * k);
const css = (c, alpha = 1) => `rgba(${c.map((v) => Math.round(clamp(v) * 255)).join(',')},${alpha})`;
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
const POPLAR = hex('#2c3038');
const PACKED = hex('#c9d3e8'); // the street's packed snow
const GLAZE = hex('#7f93b8');
const GLASS = hex('#5f7398');
const WARM = hex('#ffb35c');
const WARM_DEEP = hex('#e8742c');
const RIME = hex('#b8cdf0');

// windows: how lit, from the state
const lit = (s) => clamp(s.windows ?? 1) * (1 - 0.85 * clamp(s.morning ?? 0)) * (1 - 0.3 * clamp(s.dawn ?? 0));

// ── the things: volumes ─────────────────────────────────────────────────
// Each thing is its faces: walls are cards turned their way, roof slopes planes tilted, all standing
// on the thing's front wall (scene.json: "on"); the scene's light lights each by its turn. Each face
// is painted flat in its own metres, from its anchor (a wall: x along it, y up negative; a slope: its
// eave the near edge, y toward it).

// Windows: [u along the wall 0…1, width, name, frost?] — sill 1 m, head 1.85 m. The wall paints their
// glass (lit by the scene as the wall is), the frame's cross and, on Чуб's, the frost at their edges; the
// light in them is a card of its own just before the wall that glows (`glow`).
const PANE = { y: -1.425, h: 0.85, bar: 0.06 };
// a pane's four lights round its cross, at x, w wide
function lights(g, x, w) {
  const { y, h, bar } = PANE;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) g.rect(sx < 0 ? x - w / 2 : x + bar / 2, sy < 0 ? y - h / 2 : y + bar / 2, w / 2 - bar / 2, h / 2 - bar / 2);
  }
}

// a wall `len` long, `h` high, of `mat` (whitewash, logs, wattle), its windows' glass
function wall(g, e, len, h, mat, windows = []) {
  g.fillStyle = css(mat);
  g.fillRect(-len / 2, -h, len, h);
  for (const [u, w, , frost] of windows) {
    const x = -len / 2 + u * len;
    g.fillStyle = css(WOOD);
    g.fillRect(x - w / 2, PANE.y - PANE.h / 2, w, PANE.h);
    g.beginPath();
    lights(g, x, w);
    g.fillStyle = css(GLASS);
    g.fill();
    if (frost) {
      const f = g.createRadialGradient(x, PANE.y, w * 0.15, x, PANE.y, w * 0.75);
      f.addColorStop(0, css(RIME, 0));
      f.addColorStop(1, css(RIME, 0.7));
      g.fillStyle = f;
      g.fill();
    }
  }
}

// the light in a wall's windows while they are lit (a card that glows, just before the wall): warm
// glass, its glow a light of the scene named as the window; `door` — where a door in that wall lets a
// thread of it out under itself
function glow(g, e, len, windows, door) {
  const win = lit(e.state);
  for (const [u, w, name, frost] of windows) {
    const x = -len / 2 + u * len;
    e.at(x, PANE.y, name);
    if (win < 0.01) continue;
    const gr = g.createRadialGradient(x, PANE.y, 0, x, PANE.y, w * 0.9);
    gr.addColorStop(0, css(hex('#ffd9a0'), win));
    gr.addColorStop(1, css(WARM_DEEP, win * (frost ? 0.6 : 1)));
    g.beginPath();
    lights(g, x, w);
    g.fillStyle = gr;
    g.fill();
    e.light(x, PANE.y, w * 0.8, '#ff9a48', 0.6 * win, name);
  }
  if (door != null && win > 0.01) {
    g.fillStyle = css(WARM, 0.55 * win);
    g.fillRect(door - 0.5, -0.05, 1, 0.05);
  }
}

// a slope of a roof (a cupola, a tier): its eave `near` wide, its top `far` (0: a hip's triangle), `depth`
// up the slope
function slope(g, e, near, far, depth, mat) {
  g.beginPath();
  g.moveTo(-near / 2, depth / 2);
  g.lineTo(near / 2, depth / 2);
  g.lineTo(far / 2, -depth / 2);
  g.lineTo(-far / 2, -depth / 2);
  g.closePath();
  g.fillStyle = css(mat);
  g.fill();
}

// a cupola's cross (a card of round bars facing the eye), `k` — the frame's scale
function cross(g, e, k) {
  g.fillStyle = css(SHINGLE);
  g.fillRect(-0.07 * k, -2.4 * k, 0.14 * k, 2.4 * k);
  g.fillRect(-0.7 * k, -1.66 * k, 1.4 * k, 0.12 * k);
}

// a poplar: a tall dark spindle on a short trunk that goes into the slope (a card facing the eye)
const POPLARS = { poplar1: 19, poplar2: 15, poplar3: 17 };
function poplar(g, e) {
  const h = POPLARS[e.id];
  g.fillStyle = css(POPLAR);
  g.fillRect(-0.15, -0.1 * h, 0.3, 0.1 * h + 0.4);
  g.beginPath();
  for (let i = 0; i <= 32; i++) {
    const u = i <= 16 ? i / 16 : (32 - i) / 16;
    const x = 0.08 * h * Math.sin(Math.PI * u ** 0.75) * (i <= 16 ? 1 : -1);
    if (i) g.lineTo(x, -h * u);
    else g.moveTo(x, 0);
  }
  g.closePath();
  g.fill();
}

// the well's crane (round poles: a card facing the eye), from the post's foot: the post, the long
// sweep across the sky, its rope down into the well, the weight on its butt
function crane(g) {
  const pivot = 3.9;
  const d = Math.hypot(4.4, 6.4);
  const [dx, dy] = [-4.4 / d, 6.4 / d];
  const tip = [dx * 7.6, -(pivot + dy * 7.6)];
  const butt = [-dx * 3.2, -(pivot - dy * 3.2)];
  const line = (a, b, w) => {
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(...a);
    g.lineTo(...b);
    g.stroke();
  };
  g.strokeStyle = css(WOOD);
  g.lineCap = 'butt';
  line([0, 0], [0, -pivot - 0.25], 0.2);
  line(butt, tip, 0.085);
  line(tip, [tip[0], -0.75], 0.02);
  line([butt[0], butt[1] - 0.2], [butt[0], butt[1] + 0.35], 0.32);
}

// Чуб's door, a card on his wall (the light under it is his windows' card's)
function door(g, e) {
  g.fillStyle = css(WOOD);
  g.fillRect(-0.52, -1.95, 1.04, 1.9);
  e.at(0, -1, 'door');
}

// A chimney on its roof, and its smoke rising, leaning with the wind (the card stands at the
// chimney's foot on the roof)
function chimney(g, e) {
  const s = e.state;
  const storm = clamp(s.blizzard ?? 0);
  const morning = clamp(s.morning ?? 0);
  const tall = e.id === 'chimney_solokha' ? 4.4 : 3;
  g.fillStyle = css(LIME);
  g.fillRect(-0.42, -tall, 0.84, tall);
  g.fillStyle = css(SNOW);
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
  const band = css(WILLOW);
  const stake = css(WATTLE);
  const snow = css(SNOW);
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

return {
  LIME, WOOD, WATTLE, SNOW, SHINGLE,
  wall, glow, slope, cross, poplar, crane, door, chimney, fence, hill, snow, way, ice, glints, sky, stars, moon, blizzard,
};
